import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import type { TranscriptSegment } from '@/types/video';

const execAsync = promisify(exec);

const TEMP_DIR = process.env.TEMP_DIR || './tmp';
const USE_MOCK = process.env.USE_MOCK_TRANSCRIPTION === 'true';

export interface TranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  duration: number;
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  if (USE_MOCK) {
    return mockTranscription(audioPath);
  }

  return whisperTranscription(audioPath);
}

async function whisperTranscription(audioPath: string): Promise<TranscriptionResult> {
  const tempDir = join(process.cwd(), TEMP_DIR);
  const audioName = basename(audioPath).replace(/\.[^/.]+$/, '');
  const outputBase = join(tempDir, audioName);

  try {
    await execAsync(
      `whisper "${audioPath}" --model base --output_format json --output_dir "${tempDir}" --language en`,
      { timeout: 600000, maxBuffer: 50 * 1024 * 1024 }
    );

    const jsonPath = `${outputBase}.json`;

    if (!existsSync(jsonPath)) {
      throw new Error('Whisper output not found');
    }

    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

    const segments: TranscriptSegment[] = (data.segments || []).map((seg: any) => ({
      text: seg.text?.trim() || '',
      start: seg.start || 0,
      duration: (seg.end || 0) - (seg.start || 0),
    }));

    const fullText = segments.map((s) => s.text).join(' ');
    const totalDuration = segments.length > 0
      ? segments[segments.length - 1].start + segments[segments.length - 1].duration
      : 0;

    return {
      text: fullText,
      segments,
      language: data.language || 'en',
      duration: totalDuration,
    };
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    console.log('Falling back to mock transcription');
    return mockTranscription(audioPath);
  }
}

function mockTranscription(audioPath: string): TranscriptionResult {
  const mockText = `
    What if I told you that everything you know about content creation is wrong?
    Most creators spend hours trying to figure out what works, copying trends, and hoping for the best.
    But here's the thing - the top 1% of creators don't guess. They reverse engineer success.
    They look at what's already working and break it down into repeatable patterns.
    Think about it. Every viral video has a structure. Every high-retention piece of content follows specific rules.
    The hook grabs attention in the first three seconds. The middle keeps you watching with pattern interrupts.
    And the ending drives action - whether that's a subscribe, a comment, or a share.
    Now, you might be thinking - that sounds complicated. But it's actually simpler than you think.
    Let me show you exactly how this works. Take any successful video in your niche.
    Look at the first five seconds. What did they say? What emotion did they trigger?
    Then look at the structure. How did they transition between points?
    Finally, check the call to action. Was it direct? Was it subtle?
    Once you see these patterns, you can't unsee them. And that's when everything changes.
    Instead of creating content and hoping it works, you create content knowing it will perform.
    That's the difference between a struggling creator and a successful one.
    If you found this valuable, make sure to subscribe for more content strategy breakdowns.
    Drop a comment below with your biggest content challenge, and I'll address it in a future video.
  `.trim();

  const sentences = mockText.split(/(?<=[.!?])\s+/);
  const avgDuration = 3;
  let currentTime = 0;

  const segments: TranscriptSegment[] = sentences.map((sentence) => {
    const segment = {
      text: sentence.trim(),
      start: currentTime,
      duration: avgDuration + Math.random() * 2,
    };
    currentTime += segment.duration;
    return segment;
  });

  return {
    text: mockText,
    segments,
    language: 'en',
    duration: currentTime,
  };
}

export async function isWhisperInstalled(): Promise<boolean> {
  try {
    await execAsync('whisper --help');
    return true;
  } catch {
    return false;
  }
}

export function parseVTT(vttContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = vttContent.split('\n');

  let currentSegment: Partial<TranscriptSegment> = {};

  for (const line of lines) {
    const timestampMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);

    if (timestampMatch) {
      const startSeconds =
        parseInt(timestampMatch[1]) * 3600 +
        parseInt(timestampMatch[2]) * 60 +
        parseInt(timestampMatch[3]) +
        parseInt(timestampMatch[4]) / 1000;

      const endSeconds =
        parseInt(timestampMatch[5]) * 3600 +
        parseInt(timestampMatch[6]) * 60 +
        parseInt(timestampMatch[7]) +
        parseInt(timestampMatch[8]) / 1000;

      currentSegment.start = startSeconds;
      currentSegment.duration = endSeconds - startSeconds;
    } else if (line.trim() && !line.startsWith('WEBVTT') && !line.match(/^\d+$/)) {
      if (currentSegment.start !== undefined) {
        currentSegment.text = line.trim();
        segments.push(currentSegment as TranscriptSegment);
        currentSegment = {};
      }
    }
  }

  return segments;
}

export function parseSRT(srtContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const blocks = srtContent.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    const timestampLine = lines[1];
    const timestampMatch = timestampLine.match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );

    if (timestampMatch) {
      const startSeconds =
        parseInt(timestampMatch[1]) * 3600 +
        parseInt(timestampMatch[2]) * 60 +
        parseInt(timestampMatch[3]) +
        parseInt(timestampMatch[4]) / 1000;

      const endSeconds =
        parseInt(timestampMatch[5]) * 3600 +
        parseInt(timestampMatch[6]) * 60 +
        parseInt(timestampMatch[7]) +
        parseInt(timestampMatch[8]) / 1000;

      const text = lines.slice(2).join(' ').trim();

      segments.push({
        text,
        start: startSeconds,
        duration: endSeconds - startSeconds,
      });
    }
  }

  return segments;
}
