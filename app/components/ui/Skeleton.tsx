'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-light',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-32 h-5" />
        </div>
        <Skeleton className="w-16 h-8" />
      </div>
      <Skeleton className="w-full h-24" />
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-8">
      {/* Summary Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function InputSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-14 rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-12 rounded-lg" />
        <Skeleton className="w-32 h-12 rounded-lg" />
      </div>
    </div>
  );
}
