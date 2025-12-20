import type {
  HookAnalysis,
  RetentionAnalysis,
  StructureAnalysis,
  VisualAnalysis,
  PersonaAnalysis,
} from '@/types/analysis';
import { getAnalysisGrade } from '@/lib/glass-engine';
import { formatDuration } from '@/lib/utils/time';

export interface FormattedAnalysis {
  meta: {
    id: string;
    videoTitle: string;
    duration: string;
    analyzedAt: string;
    grade: string;
    gradeLabel: string;
    overallScore: number;
  };
  executive: {
    summary: string;
    verdict: string;
    keyStrengths: string[];
    keyImprovements: string[];
    actionItems: string[];
  };
  sections: {
    hook: FormattedHook;
    retention: FormattedRetention;
    structure: FormattedStructure;
    visual: FormattedVisual;
    persona: FormattedPersona;
  };
  platforms: FormattedPlatform[];
}

export interface FormattedHook {
  title: string;
  type: string;
  score: number;
  scoreLabel: string;
  opening: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface FormattedRetention {
  title: string;
  score: number;
  scoreLabel: string;
  timeline: Array<{
    time: string;
    label: string;
    score: number;
    insight: string;
  }>;
  patternInterrupts: Array<{ time: string; type: string }>;
  openLoops: Array<{ opened: string; closed: string | null; description: string }>;
  weakSpots: Array<{ time: string; issue: string }>;
  recommendation: string;
}

export interface FormattedStructure {
  title: string;
  framework: string;
  score: number;
  scoreLabel: string;
  sections: Array<{
    type: string;
    timeRange: string;
    description: string;
    effectiveness: string;
  }>;
  flow: string;
  recommendations: string[];
}

export interface FormattedVisual {
  title: string;
  style: string;
  metrics: {
    facePresence: { value: number; label: string };
    textOverlays: { value: number; label: string };
    sceneChanges: { value: number; label: string };
    brollUsage: { value: number; label: string };
  };
  editingStyle: string;
  dominantColors: string[];
  strengths: string[];
  recommendations: string[];
}

export interface FormattedPersona {
  title: string;
  archetype: string;
  score: number;
  scoreLabel: string;
  traits: {
    speakingPace: string;
    wordsPerMinute: number;
    authority: { score: number; label: string };
    relatability: { score: number; label: string };
    energy: string;
    persuasionStyle: string;
  };
  voiceDescription: string;
  recommendations: string[];
}

export interface FormattedPlatform {
  name: string;
  icon: string;
  compatibility: number;
  compatibilityLabel: string;
  tips: string[];
  warnings: string[];
  optimizations: string[];
}

function getScoreLabel(score: number): string {
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.6) return 'Good';
  if (score >= 0.4) return 'Fair';
  return 'Needs Work';
}

function getMetricLabel(value: number, type: string): string {
  const labels: Record<string, Record<string, string>> = {
    facePresence: {
      high: 'Strong face presence (builds connection)',
      medium: 'Moderate face presence',
      low: 'Limited face presence (consider showing face more)',
    },
    textOverlays: {
      high: 'Heavy text usage (good for accessibility)',
      medium: 'Balanced text overlays',
      low: 'Minimal text (add key points as overlays)',
    },
    sceneChanges: {
      high: 'Fast-paced editing (high energy)',
      medium: 'Balanced scene changes',
      low: 'Slow transitions (may lose attention)',
    },
    brollUsage: {
      high: 'Heavy B-roll usage (visual variety)',
      medium: 'Good B-roll integration',
      low: 'Limited B-roll (add supporting visuals)',
    },
  };

  const level = value >= 0.6 ? 'high' : value >= 0.3 ? 'medium' : 'low';
  return labels[type]?.[level] || 'Unknown';
}

export function formatAnalysis(
  analysisId: string,
  videoTitle: string,
  duration: number,
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  visual: VisualAnalysis,
  persona: PersonaAnalysis
): FormattedAnalysis {
  const overallScore =
    (hook.confidence + retention.overallScore + structure.frameworkConfidence + persona.confidence) / 4;
  const { grade, label: gradeLabel } = getAnalysisGrade(overallScore);

  // Generate executive summary
  const verdict = generateVerdict(overallScore, hook, retention, structure, persona);
  const summary = generateExecutiveSummary(hook, retention, structure, persona);
  const actionItems = generateActionItems(hook, retention, structure, visual, persona);

  return {
    meta: {
      id: analysisId,
      videoTitle,
      duration: formatDuration(duration),
      analyzedAt: new Date().toISOString(),
      grade,
      gradeLabel,
      overallScore: Math.round(overallScore * 100),
    },
    executive: {
      summary,
      verdict,
      keyStrengths: extractStrengths(hook, retention, structure, persona),
      keyImprovements: extractImprovements(hook, retention, structure, persona),
      actionItems,
    },
    sections: {
      hook: formatHook(hook),
      retention: formatRetention(retention),
      structure: formatStructure(structure),
      visual: formatVisual(visual),
      persona: formatPersona(persona),
    },
    platforms: generatePlatformRecommendations(duration, hook, retention, structure, visual, persona),
  };
}

function generateVerdict(
  score: number,
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  persona: PersonaAnalysis
): string {
  if (score >= 0.8) {
    return `This is high-performing content with a strong ${hook.type} hook and clear ${structure.framework} structure. The ${persona.archetype} delivery style resonates well.`;
  }
  if (score >= 0.6) {
    return `Solid content with room for optimization. The ${hook.type} hook works but could be stronger. Consider refining the ${structure.framework} structure for better retention.`;
  }
  if (score >= 0.4) {
    return `This content has potential but needs work. Focus on strengthening the opening hook and improving retention mechanics throughout.`;
  }
  return `Significant improvements needed. Consider restructuring the content with a stronger hook, clearer value proposition, and more engaging delivery.`;
}

function generateExecutiveSummary(
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  persona: PersonaAnalysis
): string {
  const parts: string[] = [];

  parts.push(`Content opens with a ${hook.type} hook (${Math.round(hook.confidence * 100)}% effective).`);
  parts.push(`Structure follows ${structure.framework.toUpperCase()} framework.`);
  parts.push(`Retention score: ${Math.round(retention.overallScore * 100)}% with ${retention.patternInterrupts.length} pattern interrupts.`);
  parts.push(`${persona.archetype} persona delivers at ${persona.traits.wordsPerMinute} WPM.`);

  return parts.join(' ');
}

function extractStrengths(
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  persona: PersonaAnalysis
): string[] {
  const strengths: string[] = [];

  if (hook.confidence >= 0.7) strengths.push(`Effective ${hook.type} hook`);
  if (hook.strengths) strengths.push(...hook.strengths);

  if (retention.overallScore >= 0.6) strengths.push('Strong retention mechanics');
  if (retention.patternInterrupts.length >= 3) strengths.push('Good pattern interrupt usage');
  if (retention.openLoops.length > 0 && retention.openLoops.every((l) => l.closed !== null)) {
    strengths.push('Open loops properly resolved');
  }

  if (structure.frameworkConfidence >= 0.6) strengths.push(`Clear ${structure.framework} structure`);
  if (persona.confidence >= 0.7) strengths.push(`Distinct ${persona.archetype} voice`);

  return strengths.slice(0, 5);
}

function extractImprovements(
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  persona: PersonaAnalysis
): string[] {
  const improvements: string[] = [];

  if (hook.confidence < 0.6) improvements.push('Hook needs strengthening');
  if (hook.weaknesses) improvements.push(...hook.weaknesses);

  if (retention.overallScore < 0.5) improvements.push('Retention mechanics need work');
  if (retention.weakSpots.length > 2) improvements.push(`${retention.weakSpots.length} weak spots detected`);

  if (structure.frameworkConfidence < 0.5) improvements.push('Script structure unclear');
  if (persona.confidence < 0.5) improvements.push('Persona could be more defined');

  return improvements.slice(0, 5);
}

function generateActionItems(
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  visual: VisualAnalysis,
  persona: PersonaAnalysis
): string[] {
  const items: string[] = [];

  // Hook actions
  if (hook.confidence < 0.6) {
    items.push('Rewrite opening with a stronger hook (try question or controversy)');
  }

  // Retention actions
  if (retention.patternInterrupts.length < 2) {
    items.push('Add pattern interrupts every 60-90 seconds');
  }
  if (retention.weakSpots.length > 0) {
    items.push(`Address weak spots at: ${retention.weakSpots.slice(0, 2).map((w) => w.timestamp + 's').join(', ')}`);
  }

  // Structure actions
  if (structure.frameworkConfidence < 0.5) {
    items.push('Restructure content: Hook → Problem → Solution → CTA');
  }

  // Visual actions
  if (visual.pattern.textOverlayFrequency < 0.2) {
    items.push('Add text overlays for key points');
  }
  if (visual.pattern.facePresence < 0.3) {
    items.push('Increase face-to-camera presence for connection');
  }

  // Persona actions
  if (persona.traits.wordsPerMinute < 120) {
    items.push('Increase speaking pace for higher energy');
  } else if (persona.traits.wordsPerMinute > 180) {
    items.push('Slow down slightly for clarity');
  }

  return items.slice(0, 5);
}

function formatHook(hook: HookAnalysis): FormattedHook {
  return {
    title: 'Hook Analysis',
    type: hook.type.charAt(0).toUpperCase() + hook.type.slice(1).replace('-', ' '),
    score: Math.round(hook.confidence * 100),
    scoreLabel: getScoreLabel(hook.confidence),
    opening: hook.text,
    analysis: hook.breakdown,
    strengths: hook.strengths || [],
    weaknesses: hook.weaknesses || [],
    recommendation: generateHookRecommendation(hook),
  };
}

function generateHookRecommendation(hook: HookAnalysis): string {
  if (hook.confidence >= 0.8) {
    return 'Strong hook! Consider A/B testing variations to optimize further.';
  }
  if (hook.confidence >= 0.6) {
    return 'Solid hook. Try making it more specific or adding urgency.';
  }
  if (hook.confidence >= 0.4) {
    return 'Hook needs work. Try opening with a provocative question or surprising statistic.';
  }
  return 'Weak hook. Consider complete rewrite: lead with controversy, curiosity, or a bold claim.';
}

function formatRetention(retention: RetentionAnalysis): FormattedRetention {
  return {
    title: 'Retention Analysis',
    score: Math.round(retention.overallScore * 100),
    scoreLabel: getScoreLabel(retention.overallScore),
    timeline: retention.segments.map((seg) => ({
      time: `${Math.floor(seg.startTime / 60)}:${(seg.startTime % 60).toString().padStart(2, '0')}`,
      label: seg.label,
      score: Math.round(seg.score * 100),
      insight: seg.signals.join(', ') || 'No specific signals detected',
    })),
    patternInterrupts: retention.patternInterrupts.map((pi) => ({
      time: `${Math.floor(pi.timestamp / 60)}:${(pi.timestamp % 60).toString().padStart(2, '0')}`,
      type: pi.type,
    })),
    openLoops: retention.openLoops.map((ol) => ({
      opened: `${Math.floor(ol.opened / 60)}:${(ol.opened % 60).toString().padStart(2, '0')}`,
      closed: ol.closed ? `${Math.floor(ol.closed / 60)}:${(ol.closed % 60).toString().padStart(2, '0')}` : null,
      description: ol.text,
    })),
    weakSpots: retention.weakSpots.map((ws) => ({
      time: `${Math.floor(ws.timestamp / 60)}:${(ws.timestamp % 60).toString().padStart(2, '0')}`,
      issue: ws.reason,
    })),
    recommendation: generateRetentionRecommendation(retention),
  };
}

function generateRetentionRecommendation(retention: RetentionAnalysis): string {
  const issues: string[] = [];

  if (retention.patternInterrupts.length < 2) {
    issues.push('add more pattern interrupts');
  }
  if (retention.weakSpots.length > 2) {
    issues.push('address weak spots');
  }
  if (retention.openLoops.some((l) => l.closed === null)) {
    issues.push('close open loops');
  }

  if (issues.length === 0) {
    return 'Retention is strong. Maintain current pacing and engagement techniques.';
  }
  return `Focus on: ${issues.join(', ')}.`;
}

function formatStructure(structure: StructureAnalysis): FormattedStructure {
  return {
    title: 'Structure Analysis',
    framework: structure.framework.toUpperCase(),
    score: Math.round(structure.frameworkConfidence * 100),
    scoreLabel: getScoreLabel(structure.frameworkConfidence),
    sections: structure.sections.map((sec) => ({
      type: sec.type.charAt(0).toUpperCase() + sec.type.slice(1),
      timeRange: `${formatDuration(sec.startTime)} - ${formatDuration(sec.endTime)}`,
      description: sec.text.slice(0, 100) + (sec.text.length > 100 ? '...' : ''),
      effectiveness: getScoreLabel(sec.confidence),
    })),
    flow: structure.flow || 'Linear progression',
    recommendations: structure.recommendations || [],
  };
}

function formatVisual(visual: VisualAnalysis): FormattedVisual {
  return {
    title: 'Visual Analysis',
    style: visual.style,
    metrics: {
      facePresence: {
        value: Math.round(visual.pattern.facePresence * 100),
        label: getMetricLabel(visual.pattern.facePresence, 'facePresence'),
      },
      textOverlays: {
        value: Math.round(visual.pattern.textOverlayFrequency * 100),
        label: getMetricLabel(visual.pattern.textOverlayFrequency, 'textOverlays'),
      },
      sceneChanges: {
        value: Math.round(visual.pattern.sceneChangeRate * 100),
        label: getMetricLabel(visual.pattern.sceneChangeRate, 'sceneChanges'),
      },
      brollUsage: {
        value: Math.round(visual.pattern.brollUsage * 100),
        label: getMetricLabel(visual.pattern.brollUsage, 'brollUsage'),
      },
    },
    editingStyle: visual.pattern.editingStyle,
    dominantColors: visual.pattern.dominantColors,
    strengths: visual.strengths || [],
    recommendations: visual.recommendations || [],
  };
}

function formatPersona(persona: PersonaAnalysis): FormattedPersona {
  return {
    title: 'Persona Analysis',
    archetype: persona.archetype,
    score: Math.round(persona.confidence * 100),
    scoreLabel: getScoreLabel(persona.confidence),
    traits: {
      speakingPace: persona.traits.speakingPace,
      wordsPerMinute: persona.traits.wordsPerMinute,
      authority: {
        score: Math.round(persona.traits.authorityScore * 100),
        label: getScoreLabel(persona.traits.authorityScore),
      },
      relatability: {
        score: Math.round(persona.traits.relatabilityScore * 100),
        label: getScoreLabel(persona.traits.relatabilityScore),
      },
      energy: persona.traits.energyLevel,
      persuasionStyle: persona.traits.persuasionType,
    },
    voiceDescription: persona.voiceDescription || generateVoiceDescription(persona),
    recommendations: persona.recommendations || [],
  };
}

function generateVoiceDescription(persona: PersonaAnalysis): string {
  const parts: string[] = [];
  parts.push(`${persona.archetype} archetype`);
  parts.push(`${persona.traits.speakingPace} pace (${persona.traits.wordsPerMinute} WPM)`);
  parts.push(`${persona.traits.energyLevel} energy`);
  parts.push(`${persona.traits.persuasionType} persuasion style`);
  return parts.join(', ');
}

function generatePlatformRecommendations(
  duration: number,
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  visual: VisualAnalysis,
  persona: PersonaAnalysis
): FormattedPlatform[] {
  const platforms: FormattedPlatform[] = [];
  const isShortForm = duration <= 60;
  const isMidForm = duration > 60 && duration <= 180;

  // YouTube Long-form
  if (duration > 60) {
    const score = calculatePlatformScore('youtube', duration, hook, retention, structure, visual);
    platforms.push({
      name: 'YouTube',
      icon: 'youtube',
      compatibility: score,
      compatibilityLabel: getScoreLabel(score / 100),
      tips: getYouTubeTips(duration, hook, retention, structure),
      warnings: getYouTubeWarnings(duration, hook, retention),
      optimizations: getYouTubeOptimizations(visual, persona),
    });
  }

  // YouTube Shorts
  if (duration <= 60 || isMidForm) {
    const score = calculatePlatformScore('youtube-shorts', duration, hook, retention, structure, visual);
    platforms.push({
      name: 'YouTube Shorts',
      icon: 'youtube-shorts',
      compatibility: score,
      compatibilityLabel: getScoreLabel(score / 100),
      tips: getShortsTips(duration, hook, retention),
      warnings: getShortsWarnings(duration),
      optimizations: getShortsOptimizations(visual),
    });
  }

  // TikTok
  if (duration <= 180) {
    const score = calculatePlatformScore('tiktok', duration, hook, retention, structure, visual);
    platforms.push({
      name: 'TikTok',
      icon: 'tiktok',
      compatibility: score,
      compatibilityLabel: getScoreLabel(score / 100),
      tips: getTikTokTips(duration, hook, persona),
      warnings: getTikTokWarnings(duration, visual),
      optimizations: getTikTokOptimizations(persona),
    });
  }

  // Instagram Reels
  if (duration <= 90) {
    const score = calculatePlatformScore('instagram-reels', duration, hook, retention, structure, visual);
    platforms.push({
      name: 'Instagram Reels',
      icon: 'instagram-reels',
      compatibility: score,
      compatibilityLabel: getScoreLabel(score / 100),
      tips: getReelsTips(duration, visual),
      warnings: getReelsWarnings(duration),
      optimizations: getReelsOptimizations(visual),
    });
  }

  return platforms.sort((a, b) => b.compatibility - a.compatibility);
}

function calculatePlatformScore(
  platform: string,
  duration: number,
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis,
  visual: VisualAnalysis
): number {
  let score = 50;

  // Duration fit
  const durationScores: Record<string, (d: number) => number> = {
    youtube: (d) => (d >= 480 ? 20 : d >= 180 ? 15 : 5),
    'youtube-shorts': (d) => (d <= 60 ? 20 : d <= 90 ? 10 : 0),
    tiktok: (d) => (d <= 60 ? 20 : d <= 120 ? 15 : d <= 180 ? 10 : 0),
    'instagram-reels': (d) => (d <= 30 ? 20 : d <= 60 ? 15 : d <= 90 ? 10 : 0),
  };
  score += durationScores[platform]?.(duration) || 0;

  // Hook strength (important for all platforms)
  score += hook.confidence * 15;

  // Retention (more important for long-form)
  if (platform === 'youtube') {
    score += retention.overallScore * 15;
  } else {
    score += retention.overallScore * 10;
  }

  // Visual engagement
  if (platform !== 'youtube') {
    score += visual.pattern.textOverlayFrequency * 10;
    score += visual.pattern.sceneChangeRate * 5;
  }

  return Math.min(100, Math.round(score));
}

function getYouTubeTips(
  duration: number,
  hook: HookAnalysis,
  retention: RetentionAnalysis,
  structure: StructureAnalysis
): string[] {
  const tips: string[] = [];
  tips.push('Optimize title and thumbnail for CTR');
  tips.push('Add timestamps in description for key sections');

  if (duration >= 480) {
    tips.push('Consider mid-roll ad placements at pattern interrupts');
  }

  if (retention.patternInterrupts.length >= 3) {
    tips.push('Pattern interrupts well-placed for watch time');
  }

  if (structure.framework === 'hook-value-cta') {
    tips.push('Structure aligns well with YouTube algorithm');
  }

  return tips.slice(0, 5);
}

function getYouTubeWarnings(duration: number, hook: HookAnalysis, retention: RetentionAnalysis): string[] {
  const warnings: string[] = [];

  if (hook.confidence < 0.5) {
    warnings.push('Weak hook may cause early drop-off');
  }

  if (retention.weakSpots.length > 3) {
    warnings.push('Multiple weak spots may hurt retention graph');
  }

  if (duration < 180) {
    warnings.push('Short duration may limit ad revenue');
  }

  return warnings;
}

function getYouTubeOptimizations(visual: VisualAnalysis, persona: PersonaAnalysis): string[] {
  const opts: string[] = [];

  if (visual.pattern.facePresence < 0.4) {
    opts.push('Increase face presence for better engagement');
  }

  if (persona.traits.wordsPerMinute < 130) {
    opts.push('Consider faster pacing for YouTube audience');
  }

  opts.push('Add end screen for subscriber conversion');
  opts.push('Include card links to related videos');

  return opts.slice(0, 4);
}

function getShortsTips(duration: number, hook: HookAnalysis, retention: RetentionAnalysis): string[] {
  const tips: string[] = [];
  tips.push('Hook must land in first 1-2 seconds');
  tips.push('Use trending sounds for discovery');
  tips.push('Keep text minimal but impactful');

  if (hook.type === 'curiosity-gap') {
    tips.push('Curiosity gap hooks perform well on Shorts');
  }

  return tips.slice(0, 5);
}

function getShortsWarnings(duration: number): string[] {
  const warnings: string[] = [];

  if (duration > 60) {
    warnings.push('Content exceeds 60s - will need trimming');
  }

  if (duration > 45 && duration <= 60) {
    warnings.push('Approaching max length - ensure tight pacing');
  }

  return warnings;
}

function getShortsOptimizations(visual: VisualAnalysis): string[] {
  return [
    'Use 9:16 vertical format',
    'Add captions for sound-off viewing',
    'Include call-to-action for subscribe',
    'Consider loop potential for replays',
  ];
}

function getTikTokTips(duration: number, hook: HookAnalysis, persona: PersonaAnalysis): string[] {
  const tips: string[] = [];
  tips.push('First 1 second is critical - hook immediately');
  tips.push('Use trending hashtags for discoverability');

  if (persona.traits.energyLevel === 'high') {
    tips.push('High energy aligns well with TikTok');
  }

  if (hook.type === 'controversy' || hook.type === 'direct-challenge') {
    tips.push('Controversial hooks drive engagement on TikTok');
  }

  tips.push('Reply to comments with video for algorithm boost');

  return tips.slice(0, 5);
}

function getTikTokWarnings(duration: number, visual: VisualAnalysis): string[] {
  const warnings: string[] = [];

  if (duration > 180) {
    warnings.push('Content too long for TikTok (max 3 min)');
  }

  if (visual.pattern.sceneChangeRate < 0.3) {
    warnings.push('Slow pacing may not perform well');
  }

  return warnings;
}

function getTikTokOptimizations(persona: PersonaAnalysis): string[] {
  return [
    'Add trending music or sound',
    'Use duet/stitch for engagement',
    'Post during peak hours (7-9 PM)',
    'Engage with comments in first hour',
  ];
}

function getReelsTips(duration: number, visual: VisualAnalysis): string[] {
  return [
    'Use Instagram-native music for reach',
    'Leverage Collab feature with other creators',
    'Add location tags for local discovery',
    'Use 3-5 relevant hashtags',
    'Share to Stories for additional reach',
  ];
}

function getReelsWarnings(duration: number): string[] {
  const warnings: string[] = [];

  if (duration > 90) {
    warnings.push('Content exceeds 90s Reels limit');
  }

  return warnings;
}

function getReelsOptimizations(visual: VisualAnalysis): string[] {
  return [
    'Ensure aesthetic fits Instagram feed',
    'Use consistent visual branding',
    'Add text overlays for silent viewing',
    'Include strong call-to-action',
  ];
}
