import { NextResponse } from 'next/server';
import { isYtDlpInstalled } from '@/lib/video/download';
import { isFfmpegInstalled } from '@/lib/video/process';
import { isWhisperInstalled } from '@/lib/video/transcribe';

export async function GET() {
  const [ytdlp, ffmpeg, whisper] = await Promise.all([
    isYtDlpInstalled(),
    isFfmpegInstalled(),
    isWhisperInstalled(),
  ]);

  const allReady = ytdlp && ffmpeg;

  return NextResponse.json({
    status: allReady ? 'ready' : 'degraded',
    services: {
      ytdlp: {
        installed: ytdlp,
        required: true,
        description: 'YouTube video downloading',
      },
      ffmpeg: {
        installed: ffmpeg,
        required: true,
        description: 'Video/audio processing',
      },
      whisper: {
        installed: whisper,
        required: false,
        description: 'Speech-to-text transcription (mock available)',
      },
    },
    message: allReady
      ? 'All required services are available'
      : 'Some services are missing. Install yt-dlp and ffmpeg for full functionality.',
  });
}
