/**
 * Environment configuration with validation
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Auth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;

  // App
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;

  // Optional: External services
  WHISPER_MODEL?: string;

  // Feature flags
  ENABLE_MOCK_TRANSCRIPTION: boolean;
  ENABLE_ANALYTICS: boolean;
  MAX_VIDEO_DURATION: number;
  MAX_FILE_SIZE: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getBoolEnvVar(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function getIntEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  return parsed;
}

export function getEnvConfig(): EnvConfig {
  return {
    // Database
    DATABASE_URL: getEnvVar('DATABASE_URL', 'file:./dev.db'),

    // Auth
    NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', 'dev-secret-change-in-production'),
    NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),

    // App
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    APP_URL: getOptionalEnvVar('APP_URL', 'http://localhost:3000'),

    // Optional services
    WHISPER_MODEL: process.env.WHISPER_MODEL,

    // Feature flags
    ENABLE_MOCK_TRANSCRIPTION: getBoolEnvVar('ENABLE_MOCK_TRANSCRIPTION', true),
    ENABLE_ANALYTICS: getBoolEnvVar('ENABLE_ANALYTICS', false),
    MAX_VIDEO_DURATION: getIntEnvVar('MAX_VIDEO_DURATION', 600), // 10 minutes
    MAX_FILE_SIZE: getIntEnvVar('MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
  };
}

export const env = getEnvConfig();

/**
 * Validate environment on startup
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required vars in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET === 'dev-secret-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be set to a secure value in production');
    }

    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL must be set in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
