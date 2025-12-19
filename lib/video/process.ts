import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, basename } from 'path';

const execAsync = promisify(exec);

const TEMP_DIR = process.env.TEMP_DIR || './tmp';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

export interface FrameExtraction {
  framePaths: string[];
  timestamps: number[];
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export async function getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`
    );

    const data = JSON.parse(stdout);
    const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
    const format = data.format;

    return {
      duration: parseFloat(format?.duration || '0'),
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      fps: eval(videoStream?.r_frame_rate || '0') || 0,
      bitrate: parseInt(format?.bit_rate || '0', 10),
    };
  } catch (error) {
    console.error('Failed to get video metadata:', error);
    throw new Error('Failed to analyze video file');
  }
}

export async function extractAudio(
  videoPath: string,
  outputPath?: string
): Promise<string> {
  const tempDir = join(process.cwd(), TEMP_DIR);
  ensureDir(tempDir);

  const videoName = basename(videoPath, '.mp4');
  const audioPath = outputPath || join(tempDir, `${videoName}_audio.wav`);

  if (existsSync(audioPath)) {
    return audioPath;
  }

  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`,
      { timeout: 300000 }
    );

    return audioPath;
  } catch (error) {
    console.error('Failed to extract audio:', error);
    throw new Error('Failed to extract audio from video');
  }
}

export async function extractFrames(
  videoPath: string,
  options?: {
    count?: number;
    interval?: number;
    quality?: number;
  }
): Promise<FrameExtraction> {
  const tempDir = join(process.cwd(), TEMP_DIR);
  const videoName = basename(videoPath, '.mp4');
  const framesDir = join(tempDir, `${videoName}_frames`);

  ensureDir(framesDir);

  const metadata = await getVideoMetadata(videoPath);
  const duration = metadata.duration;

  const frameCount = options?.count || 10;
  const interval = options?.interval || duration / frameCount;
  const quality = options?.quality || 2;

  const timestamps: number[] = [];
  const framePaths: string[] = [];

  try {
    for (let i = 0; i < frameCount; i++) {
      const timestamp = Math.min(i * interval, duration - 0.1);
      const framePath = join(framesDir, `frame_${i.toString().padStart(3, '0')}.jpg`);

      if (!existsSync(framePath)) {
        await execAsync(
          `ffmpeg -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v ${quality} "${framePath}" -y`,
          { timeout: 30000 }
        );
      }

      timestamps.push(timestamp);
      framePaths.push(framePath);
    }

    return { framePaths, timestamps };
  } catch (error) {
    console.error('Failed to extract frames:', error);
    throw new Error('Failed to extract frames from video');
  }
}

export async function extractKeyFrames(videoPath: string): Promise<FrameExtraction> {
  const tempDir = join(process.cwd(), TEMP_DIR);
  const videoName = basename(videoPath, '.mp4');
  const framesDir = join(tempDir, `${videoName}_keyframes`);

  ensureDir(framesDir);

  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "select=eq(pict_type\\,I)" -vsync vfr -q:v 2 "${framesDir}/keyframe_%03d.jpg" -y`,
      { timeout: 300000 }
    );

    const files = readdirSync(framesDir)
      .filter((f) => f.startsWith('keyframe_'))
      .sort();

    const framePaths = files.map((f) => join(framesDir, f));
    const metadata = await getVideoMetadata(videoPath);
    const timestamps = files.map((_, i) => (i / files.length) * metadata.duration);

    return { framePaths, timestamps };
  } catch (error) {
    console.error('Failed to extract keyframes:', error);
    return extractFrames(videoPath, { count: 10 });
  }
}

export async function generateThumbnail(
  videoPath: string,
  timestamp?: number
): Promise<string> {
  const tempDir = join(process.cwd(), TEMP_DIR);
  ensureDir(tempDir);

  const videoName = basename(videoPath, '.mp4');
  const thumbnailPath = join(tempDir, `${videoName}_thumb.jpg`);

  if (existsSync(thumbnailPath)) {
    return thumbnailPath;
  }

  const ts = timestamp || 1;

  try {
    await execAsync(
      `ffmpeg -ss ${ts} -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`,
      { timeout: 30000 }
    );

    return thumbnailPath;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw new Error('Failed to generate video thumbnail');
  }
}

export async function cleanupVideoFiles(videoId: string): Promise<void> {
  const tempDir = join(process.cwd(), TEMP_DIR);

  const patterns = [
    `${videoId}.mp4`,
    `${videoId}.mp3`,
    `${videoId}_audio.wav`,
    `${videoId}_thumb.jpg`,
  ];

  for (const pattern of patterns) {
    const filePath = join(tempDir, pattern);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (e) {
        console.warn(`Failed to delete ${filePath}`);
      }
    }
  }

  const framesDir = join(tempDir, `${videoId}_frames`);
  if (existsSync(framesDir)) {
    const files = readdirSync(framesDir);
    for (const file of files) {
      try {
        unlinkSync(join(framesDir, file));
      } catch (e) {
        console.warn(`Failed to delete frame ${file}`);
      }
    }
  }
}

export async function isFfmpegInstalled(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}
