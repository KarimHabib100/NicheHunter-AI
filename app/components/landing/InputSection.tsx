'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Loader2, ArrowRight, X, FileVideo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isYouTubeUrl } from '@/lib/utils/youtube';

type InputMode = 'url' | 'upload';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

export function InputSection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUrlSubmit = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      router.push(`/analysis/${data.analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }, [url, router]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      setUploadedFile({
        id: uploadData.file.id,
        name: uploadData.file.name,
        size: uploadData.file.size,
      });

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: uploadData.file.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
        }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Analysis failed');
      }

      router.push(`/analysis/${analyzeData.analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
      setUploadedFile(null);
    }
  }, [router]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid video file');
    }
  }, [handleFileUpload]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUrlSubmit();
    }
  }, [handleUrlSubmit, isLoading]);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setMode('url')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
            mode === 'url'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'text-gray-400 hover:text-white'
          )}
        >
          YouTube URL
        </button>
        <button
          onClick={() => setMode('upload')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
            mode === 'upload'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Upload Video
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'url' ? (
          <motion.div
            key="url-input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />

              <div className="relative flex items-center bg-surface border border-border rounded-2xl overflow-hidden focus-within:border-cyan-500/50 focus-within:shadow-glow-sm transition-all duration-300">
                <Search className="w-5 h-5 text-gray-500 ml-5" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste YouTube URL here..."
                  className="flex-1 px-4 py-5 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  disabled={isLoading}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={isLoading || !url.trim()}
                  className={cn(
                    'mr-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2',
                    isLoading || !url.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-glow active:scale-95'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-border hover:border-cyan-500/50 hover:bg-surface-light',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />

              {uploadedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <FileVideo className="w-12 h-12 text-cyan-500" />
                  <div className="text-left">
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {isLoading && <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />}
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supports MP4, MOV, AVI, WebM (max 100MB)
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-red-400 text-sm"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        className="text-center text-gray-600 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Analysis takes 30-60 seconds depending on video length
      </motion.p>
    </motion.div>
  );
}
