/**
 * Application-wide error types and utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class AnalysisError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ANALYSIS_ERROR', 500, details);
    this.name = 'AnalysisError';
  }
}

export class VideoProcessingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VIDEO_PROCESSING_ERROR', 500, details);
    this.name = 'VideoProcessingError';
  }
}

export class TranscriptionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TRANSCRIPTION_ERROR', 500, details);
    this.name = 'TranscriptionError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Format error for API response
 */
export function formatApiError(error: unknown): {
  error: string;
  code: string;
  details?: Record<string, unknown>;
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return ['VIDEO_PROCESSING_ERROR', 'TRANSCRIPTION_ERROR'].includes(error.code);
  }
  return false;
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof NotFoundError) {
    return 'The requested resource could not be found.';
  }

  if (error instanceof VideoProcessingError) {
    return 'There was an issue processing the video. Please try again or use a different video.';
  }

  if (error instanceof TranscriptionError) {
    return 'Could not transcribe the video audio. Please ensure the video has clear audio.';
  }

  if (error instanceof RateLimitError) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (error instanceof AnalysisError) {
    return 'Analysis failed. Please try again with a different video.';
  }

  return 'Something went wrong. Please try again later.';
}
