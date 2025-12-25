/**
 * Client-safe utility functions that can be used in browser
 * These functions have no Node.js dependencies
 */

/**
 * Get grade and label based on analysis score
 */
export function getAnalysisGrade(score: number): { grade: string; label: string } {
  if (score >= 0.9) return { grade: 'A+', label: 'Exceptional' };
  if (score >= 0.8) return { grade: 'A', label: 'Excellent' };
  if (score >= 0.7) return { grade: 'B+', label: 'Very Good' };
  if (score >= 0.6) return { grade: 'B', label: 'Good' };
  if (score >= 0.5) return { grade: 'C+', label: 'Above Average' };
  if (score >= 0.4) return { grade: 'C', label: 'Average' };
  if (score >= 0.3) return { grade: 'D', label: 'Needs Work' };
  return { grade: 'F', label: 'Significant Improvement Needed' };
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get score color class based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 0.7) return 'text-green-400';
  if (score >= 0.5) return 'text-yellow-400';
  if (score >= 0.3) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.6) return 'Good';
  if (score >= 0.4) return 'Fair';
  return 'Needs Work';
}
