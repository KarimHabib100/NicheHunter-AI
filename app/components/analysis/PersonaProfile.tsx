'use client';

import { motion } from 'framer-motion';
import { User, Mic, Zap, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface PersonaTraits {
  speakingPace: string;
  wordsPerMinute: number;
  authorityScore: number;
  relatabilityScore: number;
  engagementStyle: string;
  energyLevel: string;
  persuasionType: string;
}

interface PersonaProfileProps {
  archetype: string;
  confidence: number;
  traits: PersonaTraits;
  voiceDescription: string;
  recommendations: string[];
}

const archetypeLabels: Record<string, string> = {
  teacher: 'The Teacher',
  entertainer: 'The Entertainer',
  authority: 'The Authority',
  friend: 'The Friend',
  provocateur: 'The Provocateur',
};

const archetypeColors: Record<string, string> = {
  teacher: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  entertainer: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  authority: 'text-red-400 bg-red-500/10 border-red-500/30',
  friend: 'text-green-400 bg-green-500/10 border-green-500/30',
  provocateur: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export function PersonaProfile({
  archetype,
  confidence,
  traits,
  voiceDescription,
  recommendations,
}: PersonaProfileProps) {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card variant="hover" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <User className="w-5 h-5 text-pink-500" />
              </div>
              <CardTitle>Persona Profile</CardTitle>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-pink-400">{confidencePercent}%</span>
              <p className="text-xs text-gray-500">confidence</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full border ${archetypeColors[archetype] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'}`}>
              <span className="font-medium text-sm">
                {archetypeLabels[archetype] || archetype}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Voice Description</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {voiceDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-light rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Mic className="w-3 h-3" />
                <span className="text-xs">Pace</span>
              </div>
              <p className="text-sm font-medium text-white capitalize">{traits.speakingPace}</p>
              <p className="text-xs text-gray-500">{traits.wordsPerMinute} WPM</p>
            </div>

            <div className="bg-surface-light rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Zap className="w-3 h-3" />
                <span className="text-xs">Energy</span>
              </div>
              <p className="text-sm font-medium text-white capitalize">{traits.energyLevel}</p>
            </div>

            <div className="bg-surface-light rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="w-3 h-3" />
                <span className="text-xs">Authority</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${traits.authorityScore * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-surface-light rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Heart className="w-3 h-3" />
                <span className="text-xs">Relatability</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${traits.relatabilityScore * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-surface-light text-xs text-gray-400 capitalize">
              {traits.engagementStyle}
            </span>
            <span className="px-2 py-1 rounded-full bg-surface-light text-xs text-gray-400 capitalize">
              {traits.persuasionType} persuasion
            </span>
          </div>

          {recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Recommendations</p>
              <ul className="space-y-1">
                {recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
