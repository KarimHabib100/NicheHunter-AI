'use client';

import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Loader({ size = 'md', className }: LoaderProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

interface LoadingScreenProps {
  message?: string;
}

function LoadingScreen({ message = 'Analyzing...' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        <Loader size="lg" />
        <div className="absolute inset-0 blur-xl bg-cyan-500/20 rounded-full" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-cyan-500 font-mono text-sm animate-pulse">
          {message}
        </p>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProgressLoaderProps {
  progress: number;
  stage: string;
}

function ProgressLoader({ progress, stage }: ProgressLoaderProps) {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{stage}</span>
        <span className="text-cyan-500 font-mono">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export { Loader, LoadingScreen, ProgressLoader };
