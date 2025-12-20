'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileJson,
  FileText,
  Copy,
  Check,
  Share2,
  X,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '../ui';
import { Card, CardContent } from '../ui/Card';

interface ExportPanelProps {
  analysisId: string;
  videoTitle: string;
  grade: string;
  score: number;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onCopyText: () => void;
}

export function ExportPanel({
  analysisId,
  videoTitle,
  grade,
  score,
  onExportJSON,
  onExportMarkdown,
  onCopyText,
}: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    onCopyText();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Just analyzed my video with NicheHunter AI! Got a ${grade} (${score}%) on "${videoTitle.slice(0, 50)}..."`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <Card variant="glow" padding="lg">
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Export Analysis</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Download</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={onExportJSON}
                          className="flex items-center gap-3 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20">
                            <FileJson className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">JSON</p>
                            <p className="text-xs text-gray-500">Raw data</p>
                          </div>
                        </button>

                        <button
                          onClick={onExportMarkdown}
                          className="flex items-center gap-3 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">Markdown</p>
                            <p className="text-xs text-gray-500">Full report</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Quick Share</p>
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">Copied to clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-300">Copy summary to clipboard</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Share on Social</p>
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                          <span className="text-sm text-gray-300">Twitter</span>
                        </a>

                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 bg-surface-light rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          <span className="text-sm text-gray-300">LinkedIn</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <p className="text-xs text-gray-500 text-center">
                        Analysis ID: {analysisId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
