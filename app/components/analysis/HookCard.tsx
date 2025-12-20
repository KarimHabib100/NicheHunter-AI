'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
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
              <span className="text-2xl font-bold text-cyan-400">{confidencePercent}%</span>
              <p className="text-xs text-gray-500">confidence</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-cyan-400 font-medium text-sm">
                {hookTypeLabels[type] || type}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Opening Text</p>
            <p className="text-gray-300 text-sm leading-relaxed bg-surface-light p-3 rounded-lg">
              "{text.slice(0, 200)}{text.length > 200 ? '...' : ''}"
            </p>
          </div>

          {strengths.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Strengths
              </p>
              <ul className="space-y-1">
                {strengths.slice(0, 3).map((strength, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                Consider
              </p>
              <ul className="space-y-1">
                {weaknesses.slice(0, 2).map((weakness, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {weakness}
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
