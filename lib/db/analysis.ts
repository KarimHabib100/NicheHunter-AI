import { prisma } from '@/lib/prisma';
import type { AnalysisResult, AnalysisSummary } from '@/types/analysis';
import { Prisma } from '@prisma/client';

export async function createAnalysis(
  userId: string,
  data: {
    videoId?: string;
    videoUrl?: string;
    videoTitle: string;
    duration: number;
    thumbnail?: string;
  }
) {
  return prisma.analysis.create({
    data: {
      userId,
      videoId: data.videoId,
      videoUrl: data.videoUrl,
      videoTitle: data.videoTitle,
      duration: data.duration,
      thumbnail: data.thumbnail,
      transcript: '',
      hookType: 'unknown',
      hookConfidence: 0,
      hookText: '',
      hookBreakdown: '',
      hookData: '{}',
      retentionScore: 0,
      retentionSegments: '[]',
      retentionData: '{}',
      structureFramework: 'unknown',
      structureConfidence: 0,
      structureSections: '[]',
      structureData: '{}',
      visualStyle: '',
      visualPattern: '{}',
      visualData: '{}',
      personaArchetype: 'teacher',
      personaConfidence: 0,
      personaTraits: '{}',
      personaData: '{}',
      platformTips: '[]',
      status: 'PENDING',
    },
  });
}

export async function updateAnalysisStatus(
  id: string,
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
  error?: string
) {
  return prisma.analysis.update({
    where: { id },
    data: { status, error },
  });
}

export async function updateAnalysisTranscript(id: string, transcript: string) {
  return prisma.analysis.update({
    where: { id },
    data: { transcript },
  });
}

export async function updateAnalysisResults(
  id: string,
  results: {
    hook?: {
      type: string;
      confidence: number;
      text: string;
      breakdown: string;
      data: object;
    };
    retention?: {
      score: number;
      segments: object[];
      data: object;
    };
    structure?: {
      framework: string;
      confidence: number;
      sections: object[];
      data: object;
    };
    visual?: {
      style: string;
      pattern: object;
      data: object;
    };
    persona?: {
      archetype: string;
      confidence: number;
      traits: object;
      data: object;
    };
    platformTips?: object[];
  }
) {
  const updateData: Prisma.AnalysisUpdateInput = {};

  if (results.hook) {
    updateData.hookType = results.hook.type;
    updateData.hookConfidence = results.hook.confidence;
    updateData.hookText = results.hook.text;
    updateData.hookBreakdown = results.hook.breakdown;
    updateData.hookData = JSON.stringify(results.hook.data);
  }

  if (results.retention) {
    updateData.retentionScore = results.retention.score;
    updateData.retentionSegments = JSON.stringify(results.retention.segments);
    updateData.retentionData = JSON.stringify(results.retention.data);
  }

  if (results.structure) {
    updateData.structureFramework = results.structure.framework;
    updateData.structureConfidence = results.structure.confidence;
    updateData.structureSections = JSON.stringify(results.structure.sections);
    updateData.structureData = JSON.stringify(results.structure.data);
  }

  if (results.visual) {
    updateData.visualStyle = results.visual.style;
    updateData.visualPattern = JSON.stringify(results.visual.pattern);
    updateData.visualData = JSON.stringify(results.visual.data);
  }

  if (results.persona) {
    updateData.personaArchetype = results.persona.archetype;
    updateData.personaConfidence = results.persona.confidence;
    updateData.personaTraits = JSON.stringify(results.persona.traits);
    updateData.personaData = JSON.stringify(results.persona.data);
  }

  if (results.platformTips) {
    updateData.platformTips = JSON.stringify(results.platformTips);
  }

  return prisma.analysis.update({
    where: { id },
    data: updateData,
  });
}

export async function getAnalysisById(id: string, userId?: string) {
  const where: Prisma.AnalysisWhereUniqueInput = { id };

  const analysis = await prisma.analysis.findUnique({
    where,
  });

  if (!analysis) return null;
  if (userId && analysis.userId !== userId) return null;

  return analysis;
}

export async function getAnalysesByUser(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<AnalysisSummary[]> {
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
    select: {
      id: true,
      videoTitle: true,
      hookType: true,
      retentionScore: true,
      duration: true,
      status: true,
      createdAt: true,
    },
  });

  return analyses.map((a) => ({
    id: a.id,
    title: a.videoTitle,
    hookType: a.hookType as AnalysisSummary['hookType'],
    overallScore: a.retentionScore,
    platform: a.duration <= 60 ? 'youtube-shorts' : 'youtube',
    createdAt: a.createdAt,
  }));
}

export async function deleteAnalysis(id: string, userId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id },
  });

  if (!analysis || analysis.userId !== userId) {
    throw new Error('Analysis not found or unauthorized');
  }

  return prisma.analysis.delete({
    where: { id },
  });
}

export async function getAnalysisCount(userId: string) {
  return prisma.analysis.count({
    where: { userId },
  });
}
