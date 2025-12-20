'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { ScoreRing } from './ScoreRing';

interface ShareableCardProps {
  videoTitle: string;
  grade: string;
  gradeLabel: string;
  overallScore: number;
  hookType: string;
  hookScore: number;
  retentionScore: number;
  framework: string;
  archetype: string;
  topPlatform?: string;
  platformScore?: number;
}

export function ShareableCard({
  videoTitle,
  grade,
  gradeLabel,
  overallScore,
  hookType,
  hookScore,
  retentionScore,
  framework,
  archetype,
  topPlatform,
  platformScore,
}: ShareableCardProps) {
  return (
    <Card variant="glow" padding="lg" className="max-w-md mx-auto">
      <CardContent>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <ScoreRing score={overallScore} size={80} grade={grade} label={gradeLabel} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Video Analysis</p>
              <h3 className="text-lg font-bold text-white truncate">{videoTitle}</h3>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Hook" value={hookType} score={hookScore} color="cyan" />
            <StatBox label="Retention" value={`${retentionScore}%`} color="green" />
            <StatBox label="Structure" value={framework} color="purple" />
            <StatBox label="Persona" value={archetype} color="pink" />
          </div>

          {/* Platform Fit */}
          {topPlatform && (
            <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Best Platform</p>
                <p className="text-sm font-medium text-white">{topPlatform}</p>
              </div>
              {platformScore && (
                <div className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                  {platformScore}% fit
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
            <span className="text-xs text-gray-500">
              Powered by <span className="text-gray-400">Glass Engine™</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  score?: number;
  color: 'cyan' | 'green' | 'purple' | 'pink';
}

function StatBox({ label, value, score, color }: StatBoxProps) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
  };

  return (
    <motion.div
      className={`p-3 rounded-lg ${colorClasses[color].split(' ')[1]}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${colorClasses[color].split(' ')[0]}`}>{value}</p>
        {score !== undefined && <span className="text-xs text-gray-400">{score}%</span>}
      </div>
    </motion.div>
  );
}
