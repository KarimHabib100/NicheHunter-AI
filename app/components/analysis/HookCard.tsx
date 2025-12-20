'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle, Quote } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface HookCardProps {
  type: string;
  confidence: number;
  text: string;
  breakdown: string;
  strengths: string[];
  weaknesses: string[];
}

const hookTypeLabels: Record<string, string> = {
  question: 'Question Hook',
  statistic: 'Statistic Hook',
  controversy: 'Controversy Hook',
  story: 'Story Hook',
  'curiosity-gap': 'Curiosity Gap',
  'direct-challenge': 'Direct Challenge',
  unknown: 'Unclassified',
};

const hookTypeDescriptions: Record<string, string> = {
  question: 'Engages viewers by prompting them to think',
  statistic: 'Uses data to establish credibility and intrigue',
  controversy: 'Creates tension to spark engagement',
  story: 'Draws viewers in with narrative',
  'curiosity-gap': 'Creates an information gap viewers want to close',
  'direct-challenge': 'Provokes viewers to prove themselves',
  unknown: 'Hook type not detected',
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-400';
  if (confidence >= 0.4) return 'text-yellow-400';
  return 'text-red-400';
}

function getConfidenceBarColor(confidence: number): string {
  if (confidence >= 0.7) return 'bg-green-500';
  if (confidence >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function HookCard({
  type,
  confidence,
  text,
  breakdown,
  strengths,
  weaknesses,
}: HookCardProps) {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card variant="hover" className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Zap className="w-5 h-5 text-cyan-500" />
              </div>
              <CardTitle>Hook Analysis</CardTitle>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
                {confidencePercent}%
              </span>
              <p className="text-xs text-gray-500">effectiveness</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Hook Type Badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-cyan-400 font-medium text-sm">
                {hookTypeLabels[type] || type}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {hookTypeDescriptions[type] || ''}
            </p>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Hook Strength</span>
              <span className={getConfidenceColor(confidence)}>
                {confidence >= 0.7 ? 'Strong' : confidence >= 0.4 ? 'Moderate' : 'Weak'}
              </span>
            </div>
            <div className="h-2 bg-surface-light rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getConfidenceBarColor(confidence)}`}
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Opening Text */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Quote className="w-3 h-3" />
              Opening Text
            </p>
            <div className="relative bg-surface-light p-4 rounded-lg border-l-2 border-cyan-500/50">
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "{text.slice(0, 200)}{text.length > 200 ? '...' : ''}"
              </p>
            </div>
          </div>

          {/* Analysis Breakdown */}
          {breakdown && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Analysis</p>
              <p className="text-sm text-gray-400 leading-relaxed">{breakdown}</p>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Strengths
              </p>
              <ul className="space-y-1">
                {strengths.slice(0, 3).map((strength, i) => (
                  <motion.li
                    key={i}
                    className="text-sm text-gray-400 flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                Consider
              </p>
              <ul className="space-y-1">
                {weaknesses.slice(0, 2).map((weakness, i) => (
                  <motion.li
                    key={i}
                    className="text-sm text-gray-400 flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <span className="text-yellow-500 mt-1">•</span>
                    {weakness}
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
