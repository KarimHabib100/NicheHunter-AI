'use client';

import { motion } from 'framer-motion';
import { Youtube, Smartphone, Instagram, Music2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface PlatformTip {
  platform: string;
  tips: string[];
  score: number;
}

interface PlatformTipsProps {
  tips: PlatformTip[];
  duration: number;
}

const platformIcons: Record<string, React.ElementType> = {
  youtube: Youtube,
  'youtube-shorts': Smartphone,
  tiktok: Music2,
  'instagram-reels': Instagram,
};

const platformLabels: Record<string, string> = {
  youtube: 'YouTube',
  'youtube-shorts': 'YouTube Shorts',
  tiktok: 'TikTok',
  'instagram-reels': 'Instagram Reels',
};

const platformColors: Record<string, string> = {
  youtube: 'text-red-500 bg-red-500/10',
  'youtube-shorts': 'text-red-400 bg-red-500/10',
  tiktok: 'text-white bg-gray-500/10',
  'instagram-reels': 'text-pink-500 bg-pink-500/10',
};

export function PlatformTips({ tips, duration }: PlatformTipsProps) {
  if (tips.length === 0) return null;

  const primaryTip = tips[0];
  const Icon = platformIcons[primaryTip.platform] || Youtube;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card variant="hover" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${platformColors[primaryTip.platform] || 'bg-gray-500/10'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <CardTitle>Platform Optimization</CardTitle>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
              <p className="text-xs text-gray-500">duration</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${platformColors[primaryTip.platform] || 'bg-gray-500/10'} border border-current/30`}>
              <span className="font-medium text-sm">
                Optimized for {platformLabels[primaryTip.platform] || primaryTip.platform}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Recommendations</p>
            <ul className="space-y-2">
              {primaryTip.tips.slice(0, 5).map((tip, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-surface-light rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Object.entries(platformLabels).map(([key, label]) => {
              const PlatformIcon = platformIcons[key];
              const isActive = key === primaryTip.platform;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border border-cyan-500/50'
                      : 'bg-surface-light opacity-50'
                  }`}
                >
                  <PlatformIcon className="w-4 h-4" />
                  <span className="text-[10px] text-gray-400">{label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
