'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ScoreRing } from './ScoreRing';

interface SummaryCardProps {
  overallScore: number;
  grade: string;
  label: string;
  strengths: string[];
  improvements: string[];
  quickWins: string[];
  videoTitle: string;
  hookType: string;
  framework: string;
  archetype: string;
}

export function SummaryCard({
  overallScore,
  grade,
  label,
  strengths,
  improvements,
  quickWins,
  videoTitle,
  hookType,
  framework,
  archetype,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card variant="glow" padding="lg">
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col items-center lg:items-start gap-4">
              <ScoreRing
                score={overallScore * 100}
                size={140}
                grade={grade}
                label={label}
              />

              <div className="text-center lg:text-left">
                <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">
                  {videoTitle}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
                    {hookType} hook
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                    {framework}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-xs">
                    {archetype}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">Strengths</span>
                </div>
                <ul className="space-y-2">
                  {strengths.slice(0, 3).map((strength, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                      {strength}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Improve</span>
                </div>
                <ul className="space-y-2">
                  {improvements.slice(0, 3).map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <span className="text-yellow-500 mt-1">•</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Quick Wins</span>
                </div>
                <ul className="space-y-2">
                  {quickWins.slice(0, 3).map((win, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <span className="text-cyan-500 mt-1">→</span>
                      {win}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
