import type { Platform } from '@/lib/utils/platform';

export type HookType =
  | 'question'
  | 'statistic'
  | 'controversy'
  | 'story'
  | 'curiosity-gap'
  | 'direct-challenge'
  | 'unknown';

export type PersonaArchetype =
  | 'teacher'
  | 'entertainer'
  | 'authority'
  | 'friend'
  | 'provocateur';

export type ScriptSection =
  | 'hook'
  | 'problem'
  | 'agitation'
  | 'solution'
  | 'proof'
  | 'cta';

export type ScriptFramework =
  | 'pas'
  | 'aida'
  | 'hook-value-cta'
  | 'story-lesson'
  | 'problem-solution'
  | 'unknown';

export interface HookAnalysis {
  type: HookType;
  confidence: number;
  text: string;
  breakdown: string;
  strengths: string[];
  weaknesses: string[];
}

export interface RetentionSegment {
  startTime: number;
  endTime: number;
  score: number;
  label: string;
  signals: string[];
}

export interface RetentionAnalysis {
  overallScore: number;
  segments: RetentionSegment[];
  patternInterrupts: { timestamp: number; type: string }[];
  openLoops: { opened: number; closed: number | null; text: string }[];
  weakSpots: { timestamp: number; reason: string }[];
}

export interface StructureSection {
  type: ScriptSection;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

export interface StructureAnalysis {
  framework: ScriptFramework;
  frameworkConfidence: number;
  sections: StructureSection[];
  flow: string;
  recommendations: string[];
}

export interface VisualPattern {
  facePresence: number;
  textOverlayFrequency: number;
  sceneChangeRate: number;
  brollUsage: number;
  dominantColors: string[];
  editingStyle: 'fast' | 'moderate' | 'slow';
}

export interface VisualAnalysis {
  pattern: VisualPattern;
  style: string;
  strengths: string[];
  recommendations: string[];
}

export interface PersonaTraits {
  speakingPace: 'slow' | 'moderate' | 'fast';
  wordsPerMinute: number;
  authorityScore: number;
  relatabilityScore: number;
  engagementStyle: 'conversational' | 'educational' | 'persuasive';
  energyLevel: 'low' | 'medium' | 'high';
  persuasionType: 'logical' | 'emotional' | 'social';
}

export interface PersonaAnalysis {
  archetype: PersonaArchetype;
  confidence: number;
  traits: PersonaTraits;
  voiceDescription: string;
  recommendations: string[];
}

export interface PlatformTip {
  platform: Platform;
  tips: string[];
  score: number;
}

export interface AnalysisResult {
  id: string;
  videoId: string | null;
  videoUrl: string | null;
  title: string;
  duration: number;
  transcript: string;
  hook: HookAnalysis;
  retention: RetentionAnalysis;
  structure: StructureAnalysis;
  visual: VisualAnalysis;
  persona: PersonaAnalysis;
  platformTips: PlatformTip[];
  createdAt: Date;
}

export interface AnalysisSummary {
  id: string;
  title: string;
  hookType: HookType;
  overallScore: number;
  platform: Platform;
  createdAt: Date;
}
