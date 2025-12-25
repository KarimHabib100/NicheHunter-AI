import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAnalysis, updateAnalysisStatus } from '@/lib/db/analysis';
import { isYouTubeUrl, extractYouTubeId } from '@/lib/utils/youtube';
import { getVideoInfo } from '@/lib/video/download';
import { getUploadedFilePath } from '@/lib/video/upload';
import { getVideoMetadata } from '@/lib/video/process';
import { runAnalysisPipeline } from '@/lib/services/analyzer';

// MVP: Default user ID for anonymous usage
const DEFAULT_USER_ID = 'anonymous';

const analyzeUrlSchema = z.object({
  url: z.string().url('Invalid URL'),
});

const analyzeUploadSchema = z.object({
  uploadId: z.string().min(1, 'Upload ID required'),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // MVP: No auth required, use default user
    const userId = DEFAULT_USER_ID;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (body.url) {
      const parseResult = analyzeUrlSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
      const { url } = parseResult.data;

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
        // Fallback: create analysis with basic info if yt-dlp fails
        console.warn('yt-dlp failed, using fallback:', e);
        videoInfo = {
          id: videoId,
          title: `YouTube Video ${videoId}`,
          duration: 300, // default 5 min
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }

      const analysis = await createAnalysis(userId, {
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
      const parseResult = analyzeUploadSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Invalid upload data' },
          { status: 400 }
        );
      }
      const { uploadId, title } = parseResult.data;

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

      const analysis = await createAnalysis(userId, {
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
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
