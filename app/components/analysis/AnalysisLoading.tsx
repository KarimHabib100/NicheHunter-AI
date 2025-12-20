'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, Eye, MessageSquare, BarChart3 } from 'lucide-react';

const stages = [
  { icon: Brain, label: 'Analyzing hooks...', color: 'text-cyan-500' },
  { icon: BarChart3, label: 'Detecting retention patterns...', color: 'text-blue-500' },
  { icon: MessageSquare, label: 'Mapping script structure...', color: 'text-purple-500' },
  { icon: Eye, label: 'Extracting visual DNA...', color: 'text-pink-500' },
  { icon: Sparkles, label: 'Profiling persona...', color: 'text-yellow-500' },
];

interface AnalysisLoadingProps {
  stage?: number;
}

export function AnalysisLoading({ stage = 0 }: AnalysisLoadingProps) {
  const currentStage = stages[stage % stages.length];
  const Icon = currentStage.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-32 h-32 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Icon className={`w-12 h-12 ${currentStage.color}`} />
        </motion.div>
      </motion.div>

      <div className="text-center space-y-4">
        <motion.h2
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Glass Engine™ Processing
        </motion.h2>

        <motion.p
          key={stage}
          className="text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {currentStage.label}
        </motion.p>

        <div className="flex items-center justify-center gap-2 pt-4">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= stage ? 'bg-cyan-500' : 'bg-gray-700'}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: i === stage ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      <motion.p
        className="text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        This usually takes 30-60 seconds
      </motion.p>
    </div>
  );
}
