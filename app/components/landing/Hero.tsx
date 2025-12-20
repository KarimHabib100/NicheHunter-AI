'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <motion.div
      className="text-center space-y-6 max-w-4xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border text-sm text-gray-400"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Sparkles className="w-4 h-4 text-cyan-500" />
        <span>Powered by Glass Engine™</span>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <span className="gradient-text">NicheHunter</span>
        <span className="text-white"> AI</span>
      </motion.h1>

      <motion.p
        className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Reverse-Engineer Any Niche.{' '}
        <span className="text-gray-300">Predict What Wins.</span>{' '}
        <span className="text-white">Build With Precision.</span>
      </motion.p>

      <motion.p
        className="text-base text-gray-500 max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Paste a YouTube link or upload a video to decode the psychology,
        structure, and patterns behind high-performing content.
      </motion.p>
    </motion.div>
  );
}
