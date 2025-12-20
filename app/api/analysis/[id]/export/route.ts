import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatAnalysis } from '@/lib/output/formatter';
import {
  generateExportJSON,
  generateExportMarkdown,
  generateTextSummary,
} from '@/lib/output/export';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (analysis.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Analysis not yet complete' },
        { status: 400 }
      );
    }

    // Parse stored JSON data
    const hook = JSON.parse(analysis.hookAnalysis || '{}');
    const retention = JSON.parse(analysis.retentionAnalysis || '{}');
    const structure = JSON.parse(analysis.structureAnalysis || '{}');
    const visual = JSON.parse(
      analysis.visualAnalysis ||
        '{"style":"talking-head","pattern":{"facePresence":0.5,"textOverlayFrequency":0.3,"sceneChangeRate":0.3,"brollUsage":0.2,"dominantColors":[],"editingStyle":"standard"}}'
    );
    const persona = JSON.parse(analysis.personaAnalysis || '{}');

    // Format the analysis
    const formattedAnalysis = formatAnalysis(
      analysis.id,
      analysis.videoTitle || 'Untitled Video',
      analysis.duration || 0,
      hook,
      retention,
      structure,
      visual,
      persona
    );

    // Return based on requested format
    switch (format) {
      case 'json':
        const jsonContent = generateExportJSON(formattedAnalysis);
        return new NextResponse(jsonContent, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="analysis-${id.slice(0, 8)}.json"`,
          },
        });

      case 'markdown':
      case 'md':
        const mdContent = generateExportMarkdown(formattedAnalysis);
        return new NextResponse(mdContent, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="analysis-${id.slice(0, 8)}.md"`,
          },
        });

      case 'text':
      case 'txt':
        const textContent = generateTextSummary(formattedAnalysis);
        return new NextResponse(textContent, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="analysis-${id.slice(0, 8)}.txt"`,
          },
        });

      case 'formatted':
        // Return the formatted analysis as JSON (for frontend consumption)
        return NextResponse.json(formattedAnalysis);

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: json, markdown, text, formatted' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analysis' },
      { status: 500 }
    );
  }
}
