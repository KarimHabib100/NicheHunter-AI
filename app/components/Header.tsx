'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AuthButton } from './auth';

export function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">
              NicheHunter
            </span>
          </Link>

          <AuthButton />
        </div>
      </div>
    </motion.header>
  );
}
