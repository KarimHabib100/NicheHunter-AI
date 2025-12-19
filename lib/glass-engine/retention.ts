import type { TranscriptSegment } from '@/types/video';
import type { RetentionAnalysis } from '@/types/analysis';

export function analyzeRetention(
  transcript: string,
  segments: TranscriptSegment[]
): RetentionAnalysis {
  return {
    overallScore: 0,
    segments: [],
    patternInterrupts: [],
    openLoops: [],
    weakSpots: [],
  };
}
