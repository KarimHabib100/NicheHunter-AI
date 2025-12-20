import type { TranscriptSegment } from '@/types/video';
import type {
  HookAnalysis,
  RetentionAnalysis,
  StructureAnalysis,
  VisualAnalysis,
  PersonaAnalysis,
} from '@/types/analysis';

import { analyzeHook } from './hooks';
import { analyzeRetention } from './retention';
import { analyzeStructure } from './structure';
import { analyzeVisuals } from './visual';
import { analyzePersona } from './persona';

export { analyzeHook } from './hooks';
export { analyzeRetention } from './retention';
export { analyzeStructure } from './structure';
export { analyzeVisuals } from './visual';
export { analyzePersona } from './persona';

export interface GlassEngineResult {
  hook: HookAnalysis;
  retention: RetentionAnalysis;
  structure: StructureAnalysis;
  visual: VisualAnalysis;
  persona: PersonaAnalysis;
  summary: AnalysisSummary;
}

export interface AnalysisSummary {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  quickWins: string[];
}

export function runGlassEngine(
  transcript: string,
  segments: TranscriptSegment[],
  framePaths: string[] = []
): GlassEngineResult {
  const hook = analyzeHook(transcript, segments);
  const retention = analyzeRetention(transcript, segments);
  const structure = analyzeStructure(transcript, segments);
  const visual = analyzeVisuals(framePaths);
  const persona = analyzePersona(transcript, segments);

  const summary = generateSummary(hook, retention, structure, visual, persona);

  return {
    hook,
    retention,
    structure,
    visual,
    persona,
    summary,
  };
}

function generateSummary(
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  visual: VisualAnalysis,
  persona: PersonaAnalysis
): AnalysisSummary {
  const scores = [
    hook.confidence,
    retention.overallScore,
    structure.frameworkConfidence,
    persona.confidence,
  ];
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const strengths: string[] = [];
  const improvements: string[] = [];
  const quickWins: string[] = [];

  if (hook.confidence > 0.7) {
    strengths.push(`Strong ${hook.type} hook detected`);
  } else if (hook.confidence < 0.4) {
    improvements.push('Hook needs strengthening');
    quickWins.push('Try opening with a provocative question or bold statement');
  }

  if (retention.overallScore > 0.6) {
    strengths.push('Good retention mechanics in place');
  } else {
    improvements.push('Retention could be improved');
    if (retention.patternInterrupts.length < 3) {
      quickWins.push('Add more pattern interrupts every 60-90 seconds');
    }
  }

  if (structure.frameworkConfidence > 0.6) {
    strengths.push(`Clear ${structure.framework.toUpperCase()} structure`);
  } else {
    improvements.push('Script structure needs more definition');
    quickWins.push('Organize content into clear Hook → Value → CTA sections');
  }

  if (persona.confidence > 0.7) {
    strengths.push(`Distinct ${persona.archetype} persona`);
  }

  if (visual.pattern.textOverlayFrequency > 0.3) {
    strengths.push('Good use of text overlays for accessibility');
  } else {
    quickWins.push('Add text overlays for key points');
  }

  if (retention.openLoops.length > 0) {
    const unclosed = retention.openLoops.filter((l) => l.closed === null);
    if (unclosed.length > 0) {
      improvements.push(`${unclosed.length} open loop(s) not closed - may frustrate viewers`);
    } else {
      strengths.push('Open loops properly closed');
    }
  }

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    quickWins: quickWins.slice(0, 3),
  };
}

export function getAnalysisGrade(score: number): { grade: string; label: string } {
  if (score >= 0.9) return { grade: 'A+', label: 'Exceptional' };
  if (score >= 0.8) return { grade: 'A', label: 'Excellent' };
  if (score >= 0.7) return { grade: 'B+', label: 'Very Good' };
  if (score >= 0.6) return { grade: 'B', label: 'Good' };
  if (score >= 0.5) return { grade: 'C+', label: 'Above Average' };
  if (score >= 0.4) return { grade: 'C', label: 'Average' };
  if (score >= 0.3) return { grade: 'D', label: 'Needs Work' };
  return { grade: 'F', label: 'Significant Improvement Needed' };
}
