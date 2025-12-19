import type { TranscriptSegment } from '@/types/video';
import type { HookAnalysis, HookType } from '@/types/analysis';

export function analyzeHook(
  transcript: string,
  segments: TranscriptSegment[]
): HookAnalysis {
  return {
    type: 'unknown' as HookType,
    confidence: 0,
    text: '',
    breakdown: '',
    strengths: [],
    weaknesses: [],
  };
}
