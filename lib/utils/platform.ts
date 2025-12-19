export type Platform = 'youtube' | 'youtube-shorts' | 'tiktok' | 'instagram-reels';

export interface PlatformConfig {
  name: string;
  maxDuration: number;
  optimalDuration: { min: number; max: number };
  aspectRatio: string;
  hookWindow: number;
  retentionThreshold: number;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube Long-Form',
    maxDuration: 3600,
    optimalDuration: { min: 480, max: 1200 },
    aspectRatio: '16:9',
    hookWindow: 5,
    retentionThreshold: 0.5,
  },
  'youtube-shorts': {
    name: 'YouTube Shorts',
    maxDuration: 60,
    optimalDuration: { min: 30, max: 58 },
    aspectRatio: '9:16',
    hookWindow: 1,
    retentionThreshold: 0.7,
  },
  tiktok: {
    name: 'TikTok',
    maxDuration: 180,
    optimalDuration: { min: 15, max: 60 },
    aspectRatio: '9:16',
    hookWindow: 1,
    retentionThreshold: 0.6,
  },
  'instagram-reels': {
    name: 'Instagram Reels',
    maxDuration: 90,
    optimalDuration: { min: 15, max: 60 },
    aspectRatio: '9:16',
    hookWindow: 1,
    retentionThreshold: 0.65,
  },
};

export function detectPlatformFromDuration(durationSeconds: number): Platform {
  if (durationSeconds <= 60) return 'youtube-shorts';
  if (durationSeconds <= 180) return 'tiktok';
  return 'youtube';
}

export function getPlatformRecommendations(
  platform: Platform,
  durationSeconds: number
): string[] {
  const config = PLATFORM_CONFIGS[platform];
  const recommendations: string[] = [];

  if (durationSeconds < config.optimalDuration.min) {
    recommendations.push(
      `Consider extending content to at least ${Math.floor(config.optimalDuration.min / 60)}:${(config.optimalDuration.min % 60).toString().padStart(2, '0')} for better performance`
    );
  }

  if (durationSeconds > config.optimalDuration.max) {
    recommendations.push(
      `Content may benefit from tighter editing - optimal length is under ${Math.floor(config.optimalDuration.max / 60)} minutes`
    );
  }

  if (platform === 'youtube') {
    recommendations.push('Front-load value in the first 30 seconds');
    recommendations.push('Use pattern interrupts every 60-90 seconds');
    recommendations.push('Include a clear CTA before the 70% mark');
  }

  if (platform === 'youtube-shorts' || platform === 'tiktok') {
    recommendations.push('Hook must land within the first second');
    recommendations.push('Use text overlays for silent viewing');
    recommendations.push('End with a loop or strong CTA');
  }

  if (platform === 'instagram-reels') {
    recommendations.push('Optimize for sound-off viewing with captions');
    recommendations.push('Use trending audio when relevant');
    recommendations.push('Include a save-worthy moment');
  }

  return recommendations;
}
