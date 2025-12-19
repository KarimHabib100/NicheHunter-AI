import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { extractYouTubeId } from '@/lib/utils/youtube';

const execAsync = promisify(exec);

const TEMP_DIR = process.env.TEMP_DIR || './tmp';

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  description: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  viewCount: number;
  uploadDate: string;
}

export interface DownloadResult {
  videoPath: string;
  info: VideoInfo;
}

function ensureTempDir(): string {
  const dir = join(process.cwd(), TEMP_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const data = JSON.parse(stdout);

    return {
      id: data.id,
      title: data.title || 'Untitled',
      duration: data.duration || 0,
      description: data.description || '',
      thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channelName: data.channel || data.uploader || 'Unknown',
      channelId: data.channel_id || '',
      viewCount: data.view_count || 0,
      uploadDate: data.upload_date || '',
    };
  } catch (error) {
    console.error('Failed to get video info:', error);
    throw new Error('Failed to fetch video information. Make sure yt-dlp is installed.');
  }
}

export async function downloadVideo(url: string): Promise<DownloadResult> {
  const tempDir = ensureTempDir();
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const outputPath = join(tempDir, `${videoId}.mp4`);

  try {
    const info = await getVideoInfo(url);

    if (existsSync(outputPath)) {
      return { videoPath: outputPath, info };
    }

    await execAsync(
      `yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best" ` +
      `--merge-output-format mp4 ` +
      `-o "${outputPath}" ` +
      `"${url}"`,
      { maxBuffer: 50 * 1024 * 1024, timeout: 300000 }
    );

    return { videoPath: outputPath, info };
  } catch (error) {
    console.error('Failed to download video:', error);
    throw new Error('Failed to download video. Make sure yt-dlp is installed.');
  }
}

export async function downloadAudioOnly(url: string): Promise<{ audioPath: string; info: VideoInfo }> {
  const tempDir = ensureTempDir();
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const outputPath = join(tempDir, `${videoId}.mp3`);

  try {
    const info = await getVideoInfo(url);

    if (existsSync(outputPath)) {
      return { audioPath: outputPath, info };
    }

    await execAsync(
      `yt-dlp -x --audio-format mp3 --audio-quality 0 ` +
      `-o "${outputPath.replace('.mp3', '.%(ext)s')}" ` +
      `"${url}"`,
      { maxBuffer: 50 * 1024 * 1024, timeout: 300000 }
    );

    return { audioPath: outputPath, info };
  } catch (error) {
    console.error('Failed to download audio:', error);
    throw new Error('Failed to download audio. Make sure yt-dlp is installed.');
  }
}

export async function isYtDlpInstalled(): Promise<boolean> {
  try {
    await execAsync('yt-dlp --version');
    return true;
  } catch {
    return false;
  }
}
