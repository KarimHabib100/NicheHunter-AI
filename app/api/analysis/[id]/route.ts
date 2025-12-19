import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAnalysisById, deleteAnalysis } from '@/lib/db/analysis';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const analysis = await getAnalysisById(params.id, session.user.id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const result = {
      id: analysis.id,
      status: analysis.status,
      error: analysis.error,
      createdAt: analysis.createdAt,
      video: {
        id: analysis.videoId,
        url: analysis.videoUrl,
        title: analysis.videoTitle,
        duration: analysis.duration,
        thumbnail: analysis.thumbnail,
      },
      transcript: analysis.transcript,
      hook: {
        type: analysis.hookType,
        confidence: analysis.hookConfidence,
        text: analysis.hookText,
        breakdown: analysis.hookBreakdown,
        ...safeJsonParse(analysis.hookData),
      },
      retention: {
        score: analysis.retentionScore,
        segments: safeJsonParse(analysis.retentionSegments, []),
        ...safeJsonParse(analysis.retentionData),
      },
      structure: {
        framework: analysis.structureFramework,
        confidence: analysis.structureConfidence,
        sections: safeJsonParse(analysis.structureSections, []),
        ...safeJsonParse(analysis.structureData),
      },
      visual: {
        style: analysis.visualStyle,
        pattern: safeJsonParse(analysis.visualPattern),
        ...safeJsonParse(analysis.visualData),
      },
      persona: {
        archetype: analysis.personaArchetype,
        confidence: analysis.personaConfidence,
        traits: safeJsonParse(analysis.personaTraits),
        ...safeJsonParse(analysis.personaData),
      },
      platformTips: safeJsonParse(analysis.platformTips, []),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await deleteAnalysis(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete analysis error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T = {} as T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
