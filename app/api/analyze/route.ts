import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { createAnalysis, updateAnalysisStatus } from '@/lib/db/analysis';
import { isYouTubeUrl, extractYouTubeId } from '@/lib/utils/youtube';
import { getVideoInfo } from '@/lib/video/download';
import { getUploadedFilePath } from '@/lib/video/upload';
import { getVideoMetadata } from '@/lib/video/process';
import { runAnalysisPipeline } from '@/lib/services/analyzer';

const analyzeUrlSchema = z.object({
  url: z.string().url('Invalid URL'),
});

const analyzeUploadSchema = z.object({
  uploadId: z.string().min(1, 'Upload ID required'),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.url) {
      const { url } = analyzeUrlSchema.parse(body);

      if (!isYouTubeUrl(url)) {
        return NextResponse.json(
          { error: 'Only YouTube URLs are supported' },
          { status: 400 }
        );
      }

      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return NextResponse.json(
          { error: 'Could not extract video ID' },
          { status: 400 }
        );
      }

      let videoInfo;
      try {
        videoInfo = await getVideoInfo(url);
      } catch (e) {
        return NextResponse.json(
          { error: 'Failed to fetch video information. Make sure yt-dlp is installed.' },
          { status: 500 }
        );
      }

      const analysis = await createAnalysis(session.user.id, {
        videoId: videoInfo.id,
        videoUrl: url,
        videoTitle: videoInfo.title,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
      });

      runAnalysisPipeline(analysis.id, { type: 'url', url }).catch((error) => {
        console.error('Analysis pipeline failed:', error);
        updateAnalysisStatus(analysis.id, 'FAILED', error.message);
      });

      return NextResponse.json({
        success: true,
        analysisId: analysis.id,
        video: {
          id: videoInfo.id,
          title: videoInfo.title,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
        },
      });
    }

    if (body.uploadId) {
      const { uploadId, title } = analyzeUploadSchema.parse(body);

      const filePath = getUploadedFilePath(uploadId);
      if (!filePath) {
        return NextResponse.json(
          { error: 'Uploaded file not found' },
          { status: 404 }
        );
      }

      let metadata;
      try {
        metadata = await getVideoMetadata(filePath);
      } catch (e) {
        return NextResponse.json(
          { error: 'Failed to process video file' },
          { status: 500 }
        );
      }

      const analysis = await createAnalysis(session.user.id, {
        videoTitle: title || `Uploaded Video - ${uploadId}`,
        duration: Math.round(metadata.duration),
      });

      runAnalysisPipeline(analysis.id, { type: 'file', filePath }).catch((error) => {
        console.error('Analysis pipeline failed:', error);
        updateAnalysisStatus(analysis.id, 'FAILED', error.message);
      });

      return NextResponse.json({
        success: true,
        analysisId: analysis.id,
        video: {
          title: title || 'Uploaded Video',
          duration: Math.round(metadata.duration),
        },
      });
    }

    return NextResponse.json(
      { error: 'Either url or uploadId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analyze error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
