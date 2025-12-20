import type { VisualAnalysis, VisualPattern } from '@/types/analysis';
import { existsSync, readFileSync } from 'fs';

export function analyzeVisuals(framePaths: string[]): VisualAnalysis {
  if (framePaths.length === 0) {
    return createDefaultVisualAnalysis();
  }

  const frameAnalyses = framePaths.map((path) => analyzeFrame(path));
  const pattern = aggregatePatterns(frameAnalyses);
  const style = determineEditingStyle(frameAnalyses);
  const strengths = identifyVisualStrengths(pattern);
  const recommendations = generateVisualRecommendations(pattern);

  return {
    pattern,
    style,
    strengths,
    recommendations,
  };
}

interface FrameAnalysis {
  hasFace: boolean;
  hasTextOverlay: boolean;
  brightness: number;
  dominantColors: string[];
  colorVariance: number;
}

function analyzeFrame(framePath: string): FrameAnalysis {
  if (!existsSync(framePath)) {
    return getDefaultFrameAnalysis();
  }

  try {
    const buffer = readFileSync(framePath);
    const analysis = analyzeImageBuffer(buffer);
    return analysis;
  } catch (error) {
    return getDefaultFrameAnalysis();
  }
}

function analyzeImageBuffer(buffer: Buffer): FrameAnalysis {
  const signature = buffer.slice(0, 3);
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;

  if (!isJpeg) {
    return getDefaultFrameAnalysis();
  }

  const sampleSize = Math.min(buffer.length, 50000);
  const samples: number[][] = [];

  for (let i = 0; i < sampleSize - 3; i += 100) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];

    if (r !== undefined && g !== undefined && b !== undefined) {
      samples.push([r, g, b]);
    }
  }

  if (samples.length === 0) {
    return getDefaultFrameAnalysis();
  }

  const brightness = calculateBrightness(samples);
  const dominantColors = extractDominantColors(samples);
  const hasFace = detectFacePresence(samples);
  const hasTextOverlay = detectTextOverlay(samples);
  const colorVariance = calculateColorVariance(samples);

  return {
    hasFace,
    hasTextOverlay,
    brightness,
    dominantColors,
    colorVariance,
  };
}

function calculateBrightness(samples: number[][]): number {
  const totalBrightness = samples.reduce((sum, [r, g, b]) => {
    return sum + (0.299 * r + 0.587 * g + 0.114 * b);
  }, 0);

  return totalBrightness / samples.length / 255;
}

function extractDominantColors(samples: number[][]): string[] {
  const colorBuckets: Map<string, number> = new Map();

  for (const [r, g, b] of samples) {
    const bucket = `${Math.floor(r / 64) * 64},${Math.floor(g / 64) * 64},${Math.floor(b / 64) * 64}`;
    colorBuckets.set(bucket, (colorBuckets.get(bucket) || 0) + 1);
  }

  const sorted = [...colorBuckets.entries()].sort((a, b) => b[1] - a[1]);
  const topColors = sorted.slice(0, 3).map(([color]) => {
    const [r, g, b] = color.split(',').map(Number);
    return rgbToHex(r, g, b);
  });

  return topColors;
}

function detectFacePresence(samples: number[][]): boolean {
  let skinToneCount = 0;

  for (const [r, g, b] of samples) {
    if (isSkinTone(r, g, b)) {
      skinToneCount++;
    }
  }

  const skinRatio = skinToneCount / samples.length;
  return skinRatio > 0.05 && skinRatio < 0.6;
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const rules = [
    r > 95 && g > 40 && b > 20,
    r > g && r > b,
    Math.abs(r - g) > 15,
    r - g > 15 || r - b > 15,
  ];

  const rgbMax = Math.max(r, g, b);
  const rgbMin = Math.min(r, g, b);

  return rules.every(Boolean) && rgbMax - rgbMin > 15;
}

function detectTextOverlay(samples: number[][]): boolean {
  let highContrastCount = 0;
  let whiteCount = 0;
  let blackCount = 0;

  for (const [r, g, b] of samples) {
    const brightness = (r + g + b) / 3;

    if (brightness > 240) whiteCount++;
    if (brightness < 15) blackCount++;

    const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
    if (variance < 30 && (brightness > 200 || brightness < 50)) {
      highContrastCount++;
    }
  }

  const highContrastRatio = highContrastCount / samples.length;
  const hasWhiteBlackMix = whiteCount > samples.length * 0.05 && blackCount > samples.length * 0.02;

  return highContrastRatio > 0.1 || hasWhiteBlackMix;
}

function calculateColorVariance(samples: number[][]): number {
  const avgR = samples.reduce((sum, [r]) => sum + r, 0) / samples.length;
  const avgG = samples.reduce((sum, [, g]) => sum + g, 0) / samples.length;
  const avgB = samples.reduce((sum, [, , b]) => sum + b, 0) / samples.length;

  const variance = samples.reduce((sum, [r, g, b]) => {
    return sum + Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
  }, 0) / samples.length;

  return Math.sqrt(variance) / 255;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function aggregatePatterns(frameAnalyses: FrameAnalysis[]): VisualPattern {
  const faceCount = frameAnalyses.filter((f) => f.hasFace).length;
  const textCount = frameAnalyses.filter((f) => f.hasTextOverlay).length;

  const colorChanges = calculateSceneChanges(frameAnalyses);

  const allColors: Map<string, number> = new Map();
  for (const frame of frameAnalyses) {
    for (const color of frame.dominantColors) {
      allColors.set(color, (allColors.get(color) || 0) + 1);
    }
  }
  const sortedColors = [...allColors.entries()].sort((a, b) => b[1] - a[1]);
  const dominantColors = sortedColors.slice(0, 5).map(([color]) => color);

  const avgVariance = frameAnalyses.reduce((sum, f) => sum + f.colorVariance, 0) / frameAnalyses.length;
  const brollUsage = 1 - (faceCount / frameAnalyses.length);

  let editingStyle: 'fast' | 'moderate' | 'slow' = 'moderate';
  if (colorChanges > 0.6) editingStyle = 'fast';
  else if (colorChanges < 0.3) editingStyle = 'slow';

  return {
    facePresence: faceCount / frameAnalyses.length,
    textOverlayFrequency: textCount / frameAnalyses.length,
    sceneChangeRate: colorChanges,
    brollUsage: Math.max(0, brollUsage),
    dominantColors,
    editingStyle,
  };
}

function calculateSceneChanges(frameAnalyses: FrameAnalysis[]): number {
  if (frameAnalyses.length < 2) return 0;

  let significantChanges = 0;

  for (let i = 1; i < frameAnalyses.length; i++) {
    const prev = frameAnalyses[i - 1];
    const curr = frameAnalyses[i];

    const brightnessDiff = Math.abs(prev.brightness - curr.brightness);
    const varianceDiff = Math.abs(prev.colorVariance - curr.colorVariance);

    if (brightnessDiff > 0.15 || varianceDiff > 0.1) {
      significantChanges++;
    }
  }

  return significantChanges / (frameAnalyses.length - 1);
}

function determineEditingStyle(frameAnalyses: FrameAnalysis[]): string {
  const pattern = aggregatePatterns(frameAnalyses);

  const styles: string[] = [];

  if (pattern.facePresence > 0.7) {
    styles.push('talking head');
  } else if (pattern.facePresence > 0.3) {
    styles.push('mixed presence');
  } else {
    styles.push('faceless/B-roll focused');
  }

  if (pattern.textOverlayFrequency > 0.5) {
    styles.push('text-heavy');
  }

  if (pattern.editingStyle === 'fast') {
    styles.push('fast-paced editing');
  } else if (pattern.editingStyle === 'slow') {
    styles.push('slow/cinematic');
  }

  if (pattern.brollUsage > 0.5) {
    styles.push('heavy B-roll');
  }

  return styles.join(', ') || 'standard video format';
}

function identifyVisualStrengths(pattern: VisualPattern): string[] {
  const strengths: string[] = [];

  if (pattern.facePresence > 0.5) {
    strengths.push('Strong on-camera presence builds personal connection');
  }

  if (pattern.textOverlayFrequency > 0.3) {
    strengths.push('Text overlays support sound-off viewing');
  }

  if (pattern.editingStyle === 'fast') {
    strengths.push('Dynamic editing maintains visual interest');
  }

  if (pattern.brollUsage > 0.3 && pattern.brollUsage < 0.7) {
    strengths.push('Good mix of talking head and B-roll keeps content fresh');
  }

  if (pattern.sceneChangeRate > 0.3 && pattern.sceneChangeRate < 0.7) {
    strengths.push('Balanced pacing with regular visual variety');
  }

  return strengths.length > 0 ? strengths : ['Visual style detected'];
}

function generateVisualRecommendations(pattern: VisualPattern): string[] {
  const recommendations: string[] = [];

  if (pattern.facePresence < 0.2) {
    recommendations.push('Consider adding more on-camera presence to build connection');
  }

  if (pattern.textOverlayFrequency < 0.2) {
    recommendations.push('Add text overlays for key points - helps with sound-off viewing');
  }

  if (pattern.editingStyle === 'slow' && pattern.sceneChangeRate < 0.2) {
    recommendations.push('Increase visual variety with more frequent cuts or B-roll');
  }

  if (pattern.editingStyle === 'fast' && pattern.sceneChangeRate > 0.8) {
    recommendations.push('Consider slowing down editing pace in key explanation moments');
  }

  if (pattern.brollUsage < 0.1 && pattern.facePresence > 0.8) {
    recommendations.push('Break up talking head shots with relevant B-roll footage');
  }

  if (pattern.dominantColors.length > 0) {
    const colors = pattern.dominantColors.slice(0, 2).join(', ');
    recommendations.push(`Color palette detected (${colors}) - ensure consistency across content`);
  }

  return recommendations.slice(0, 4);
}

function getDefaultFrameAnalysis(): FrameAnalysis {
  return {
    hasFace: false,
    hasTextOverlay: false,
    brightness: 0.5,
    dominantColors: ['#404040'],
    colorVariance: 0.3,
  };
}

function createDefaultVisualAnalysis(): VisualAnalysis {
  return {
    pattern: {
      facePresence: 0.5,
      textOverlayFrequency: 0.3,
      sceneChangeRate: 0.4,
      brollUsage: 0.3,
      dominantColors: ['#1a1a2e', '#16213e', '#0f3460'],
      editingStyle: 'moderate',
    },
    style: 'Standard video format (frames not analyzed)',
    strengths: [
      'Unable to analyze frames - using default assessment',
    ],
    recommendations: [
      'Ensure strong on-camera presence for connection',
      'Use text overlays for key points',
      'Vary shot types every 5-10 seconds',
      'Maintain consistent color grading',
    ],
  };
}
