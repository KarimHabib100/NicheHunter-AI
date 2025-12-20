'use client';

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Sparkles, Clock } from 'lucide-react';
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number): string {
  if (score >= 0.7) return 'text-green-400';
  if (score >= 0.5) return 'text-blue-400';
  if (score >= 0.35) return 'text-yellow-400';
  return 'text-red-400';
}

export function RetentionChart({
  overallScore,
  segments,
  patternInterrupts,
  weakSpots,
}: RetentionChartProps) {
  const scorePercent = Math.round(overallScore * 100);

  const getBarColor = (score: number) => {
    if (score >= 0.7) return 'bg-gradient-to-t from-cyan-600 to-cyan-400';
    if (score >= 0.5) return 'bg-gradient-to-t from-blue-600 to-blue-400';
    if (score >= 0.35) return 'bg-gradient-to-t from-yellow-600 to-yellow-400';
    return 'bg-gradient-to-t from-red-600 to-red-400';
  };

  const getRetentionLabel = (score: number): string => {
    if (score >= 0.7) return 'Excellent';
    if (score >= 0.5) return 'Good';
    if (score >= 0.35) return 'Fair';
    return 'Needs Work';
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
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {scorePercent}%
              </span>
              <p className="text-xs text-gray-500">{getRetentionLabel(overallScore)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Engagement Curve */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Engagement Curve</p>
            <div className="relative">
              <div className="flex items-end gap-1 h-28 bg-surface-light rounded-lg p-3">
                {segments.map((segment, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t ${getBarColor(segment.score)} relative group cursor-pointer`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(segment.score * 100, 5)}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 shadow-lg">
                      <p className="font-medium text-white">{segment.label}</p>
                      <p className={getScoreColor(segment.score)}>{Math.round(segment.score * 100)}% engagement</p>
                      {segment.signals.length > 0 && (
                        <p className="text-gray-500 mt-1">{segment.signals[0]}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
                <span>0:00</span>
                <span>End</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-surface-light rounded-lg p-3 border border-transparent hover:border-cyan-500/30 transition-colors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <p className="text-xs text-gray-500">Pattern Interrupts</p>
              </div>
              <p className="text-xl font-bold text-white">{patternInterrupts.length}</p>
              <p className="text-xs text-gray-600">
                {patternInterrupts.length >= 3 ? 'Good pacing' : 'Add more variety'}
              </p>
            </motion.div>
            <motion.div
              className="bg-surface-light rounded-lg p-3 border border-transparent hover:border-yellow-500/30 transition-colors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <p className="text-xs text-gray-500">Weak Spots</p>
              </div>
              <p className="text-xl font-bold text-white">{weakSpots.length}</p>
              <p className="text-xs text-gray-600">
                {weakSpots.length === 0 ? 'No issues found' : 'Review these areas'}
              </p>
            </motion.div>
          </div>

          {/* Pattern Interrupts List */}
          {patternInterrupts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-500" />
                Pattern Interrupts
              </p>
              <div className="flex flex-wrap gap-2">
                {patternInterrupts.slice(0, 5).map((pi, i) => (
                  <motion.span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <span className="text-gray-500">{formatTime(pi.timestamp)}</span>
                    {pi.type}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Weak Spots */}
          {weakSpots.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Areas for Improvement
              </p>
              <ul className="space-y-2">
                {weakSpots.slice(0, 3).map((spot, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <span className="text-xs text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                      {formatTime(spot.timestamp)}
                    </span>
                    <span className="text-sm text-gray-400">{spot.reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
