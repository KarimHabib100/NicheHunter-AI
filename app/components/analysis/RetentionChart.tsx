'use client';

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RetentionSegment {
  startTime: number;
  endTime: number;
  score: number;
  label: string;
  signals: string[];
}

interface RetentionChartProps {
  overallScore: number;
  segments: RetentionSegment[];
  patternInterrupts: { timestamp: number; type: string }[];
  weakSpots: { timestamp: number; reason: string }[];
}

export function RetentionChart({
  overallScore,
  segments,
  patternInterrupts,
  weakSpots,
}: RetentionChartProps) {
  const scorePercent = Math.round(overallScore * 100);

  const getBarColor = (score: number) => {
    if (score >= 0.7) return 'bg-cyan-500';
    if (score >= 0.5) return 'bg-blue-500';
    if (score >= 0.35) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="hover" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <CardTitle>Retention Analysis</CardTitle>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-400">{scorePercent}%</span>
              <p className="text-xs text-gray-500">retention score</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Engagement Curve</p>
            <div className="flex items-end gap-1 h-24 bg-surface-light rounded-lg p-3">
              {segments.map((segment, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-t ${getBarColor(segment.score)} relative group`}
                  initial={{ height: 0 }}
                  animate={{ height: `${segment.score * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                    {segment.label}: {Math.round(segment.score * 100)}%
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-light rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Pattern Interrupts</p>
              <p className="text-xl font-bold text-white">{patternInterrupts.length}</p>
            </div>
            <div className="bg-surface-light rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Weak Spots</p>
              <p className="text-xl font-bold text-white">{weakSpots.length}</p>
            </div>
          </div>

          {weakSpots.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Areas for Improvement
              </p>
              <ul className="space-y-1">
                {weakSpots.slice(0, 3).map((spot, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {spot.reason}
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
