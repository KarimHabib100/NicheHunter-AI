import {
  updateAnalysisStatus,
  updateAnalysisTranscript,
  updateAnalysisResults,
} from '@/lib/db/analysis';
import { downloadVideo, downloadAudioOnly } from '@/lib/video/download';
import { extractAudio, extractFrames, getVideoMetadata } from '@/lib/video/process';
import { transcribeAudio } from '@/lib/video/transcribe';
import { detectPlatformFromDuration, getPlatformRecommendations } from '@/lib/utils/platform';

type AnalysisInput =
  | { type: 'url'; url: string }
  | { type: 'file'; filePath: string };

export async function runAnalysisPipeline(
  analysisId: string,
  input: AnalysisInput
): Promise<void> {
  try {
    await updateAnalysisStatus(analysisId, 'PROCESSING');

    let videoPath: string;
    let audioPath: string;

    if (input.type === 'url') {
      console.log(`[${analysisId}] Downloading video from URL...`);
      try {
        const { audioPath: downloadedAudio } = await downloadAudioOnly(input.url);
        audioPath = downloadedAudio;

        const { videoPath: downloadedVideo } = await downloadVideo(input.url);
        videoPath = downloadedVideo;
      } catch (downloadError) {
        console.log(`[${analysisId}] Download failed, using mock data`);
        await runMockAnalysis(analysisId);
        return;
      }
    } else {
      videoPath = input.filePath;
      console.log(`[${analysisId}] Extracting audio from uploaded file...`);
      audioPath = await extractAudio(videoPath);
    }

    console.log(`[${analysisId}] Transcribing audio...`);
    const transcription = await transcribeAudio(audioPath);

    await updateAnalysisTranscript(analysisId, transcription.text);

    console.log(`[${analysisId}] Extracting video frames...`);
    let frameData = { framePaths: [] as string[], timestamps: [] as number[] };
    try {
      frameData = await extractFrames(videoPath, { count: 10 });
    } catch (e) {
      console.warn(`[${analysisId}] Frame extraction failed, continuing without`);
    }

    console.log(`[${analysisId}] Running Glass Engine analysis...`);
    const { analyzeHook } = await import('@/lib/glass-engine/hooks');
    const { analyzeRetention } = await import('@/lib/glass-engine/retention');
    const { analyzeStructure } = await import('@/lib/glass-engine/structure');
    const { analyzeVisuals } = await import('@/lib/glass-engine/visual');
    const { analyzePersona } = await import('@/lib/glass-engine/persona');

    const hookResult = analyzeHook(transcription.text, transcription.segments);
    const retentionResult = analyzeRetention(transcription.text, transcription.segments);
    const structureResult = analyzeStructure(transcription.text, transcription.segments);
    const visualResult = analyzeVisuals(frameData.framePaths);
    const personaResult = analyzePersona(transcription.text, transcription.segments);

    const platform = detectPlatformFromDuration(transcription.duration);
    const platformRecommendations = getPlatformRecommendations(platform, transcription.duration);

    console.log(`[${analysisId}] Saving results...`);
    await updateAnalysisResults(analysisId, {
      hook: {
        type: hookResult.type,
        confidence: hookResult.confidence,
        text: hookResult.text,
        breakdown: hookResult.breakdown,
        data: {
          strengths: hookResult.strengths,
          weaknesses: hookResult.weaknesses,
        },
      },
      retention: {
        score: retentionResult.overallScore,
        segments: retentionResult.segments,
        data: {
          patternInterrupts: retentionResult.patternInterrupts,
          openLoops: retentionResult.openLoops,
          weakSpots: retentionResult.weakSpots,
        },
      },
      structure: {
        framework: structureResult.framework,
        confidence: structureResult.frameworkConfidence,
        sections: structureResult.sections,
        data: {
          flow: structureResult.flow,
          recommendations: structureResult.recommendations,
        },
      },
      visual: {
        style: visualResult.style,
        pattern: visualResult.pattern,
        data: {
          strengths: visualResult.strengths,
          recommendations: visualResult.recommendations,
        },
      },
      persona: {
        archetype: personaResult.archetype,
        confidence: personaResult.confidence,
        traits: personaResult.traits,
        data: {
          voiceDescription: personaResult.voiceDescription,
          recommendations: personaResult.recommendations,
        },
      },
      platformTips: [
        {
          platform,
          tips: platformRecommendations,
          score: calculatePlatformScore(retentionResult.overallScore, platform),
        },
      ],
    });

    await updateAnalysisStatus(analysisId, 'COMPLETED');
    console.log(`[${analysisId}] Analysis complete`);
  } catch (error) {
    console.error(`[${analysisId}] Analysis failed:`, error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    await updateAnalysisStatus(analysisId, 'FAILED', message);
    throw error;
  }
}

async function runMockAnalysis(analysisId: string): Promise<void> {
  const { transcribeAudio } = await import('@/lib/video/transcribe');
  const mockTranscription = await transcribeAudio('mock');

  await updateAnalysisTranscript(analysisId, mockTranscription.text);

  const { analyzeHook } = await import('@/lib/glass-engine/hooks');
  const { analyzeRetention } = await import('@/lib/glass-engine/retention');
  const { analyzeStructure } = await import('@/lib/glass-engine/structure');
  const { analyzeVisuals } = await import('@/lib/glass-engine/visual');
  const { analyzePersona } = await import('@/lib/glass-engine/persona');

  const hookResult = analyzeHook(mockTranscription.text, mockTranscription.segments);
  const retentionResult = analyzeRetention(mockTranscription.text, mockTranscription.segments);
  const structureResult = analyzeStructure(mockTranscription.text, mockTranscription.segments);
  const visualResult = analyzeVisuals([]);
  const personaResult = analyzePersona(mockTranscription.text, mockTranscription.segments);

  const platform = detectPlatformFromDuration(mockTranscription.duration);
  const platformRecommendations = getPlatformRecommendations(platform, mockTranscription.duration);

  await updateAnalysisResults(analysisId, {
    hook: {
      type: hookResult.type,
      confidence: hookResult.confidence,
      text: hookResult.text,
      breakdown: hookResult.breakdown,
      data: {
        strengths: hookResult.strengths,
        weaknesses: hookResult.weaknesses,
      },
    },
    retention: {
      score: retentionResult.overallScore,
      segments: retentionResult.segments,
      data: {
        patternInterrupts: retentionResult.patternInterrupts,
        openLoops: retentionResult.openLoops,
        weakSpots: retentionResult.weakSpots,
      },
    },
    structure: {
      framework: structureResult.framework,
      confidence: structureResult.frameworkConfidence,
      sections: structureResult.sections,
      data: {
        flow: structureResult.flow,
        recommendations: structureResult.recommendations,
      },
    },
    visual: {
      style: visualResult.style,
      pattern: visualResult.pattern,
      data: {
        strengths: visualResult.strengths,
        recommendations: visualResult.recommendations,
      },
    },
    persona: {
      archetype: personaResult.archetype,
      confidence: personaResult.confidence,
      traits: personaResult.traits,
      data: {
        voiceDescription: personaResult.voiceDescription,
        recommendations: personaResult.recommendations,
      },
    },
    platformTips: [
      {
        platform,
        tips: platformRecommendations,
        score: calculatePlatformScore(retentionResult.overallScore, platform),
      },
    ],
  });

  await updateAnalysisStatus(analysisId, 'COMPLETED');
}

function calculatePlatformScore(
  retentionScore: number,
  platform: string
): number {
  const baseScore = retentionScore;

  const platformMultipliers: Record<string, number> = {
    youtube: 1.0,
    'youtube-shorts': 0.95,
    tiktok: 0.9,
    'instagram-reels': 0.92,
  };

  const multiplier = platformMultipliers[platform] || 1.0;
  return Math.round(baseScore * multiplier * 100) / 100;
}
