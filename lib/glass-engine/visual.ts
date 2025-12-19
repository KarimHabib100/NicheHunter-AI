import type { VisualAnalysis } from '@/types/analysis';

export function analyzeVisuals(framePaths: string[]): VisualAnalysis {
  return {
    pattern: {
      facePresence: 0,
      textOverlayFrequency: 0,
      sceneChangeRate: 0,
      brollUsage: 0,
      dominantColors: [],
      editingStyle: 'moderate',
    },
    style: '',
    strengths: [],
    recommendations: [],
  };
}
