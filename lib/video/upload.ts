import { existsSync, mkdirSync, writeFileSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import type { UploadedVideo } from '@/types/video';

const TEMP_DIR = process.env.TEMP_DIR || './tmp';
const MAX_SIZE_MB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '100', 10);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
];

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

function ensureTempDir(): string {
  const dir = join(process.cwd(), TEMP_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function validateUpload(
  file: { name: string; size: number; type: string }
): { valid: boolean; error?: string } {
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${MAX_SIZE_MB}MB)`,
    };
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    const extensionValid = ALLOWED_EXTENSIONS.includes(extension);
    if (!extensionValid) {
      return {
        valid: false,
        error: 'Invalid video format',
      };
    }
  }

  return { valid: true };
}

export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadedVideo> {
  const tempDir = ensureTempDir();
  const id = nanoid();
  const extension = originalName.split('.').pop() || 'mp4';
  const fileName = `${id}.${extension}`;
  const filePath = join(tempDir, fileName);

  writeFileSync(filePath, fileBuffer);

  const stats = statSync(filePath);

  return {
    id,
    originalName,
    path: filePath,
    size: stats.size,
    mimeType,
    duration: 0,
  };
}

export async function processUploadedFile(
  formData: FormData
): Promise<UploadedVideo> {
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new Error('No file provided');
  }

  const validation = validateUpload({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return saveUploadedFile(buffer, file.name, file.type);
}

export function deleteUploadedFile(filePath: string): boolean {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

export function getUploadedFilePath(id: string): string | null {
  const tempDir = join(process.cwd(), TEMP_DIR);

  for (const ext of ALLOWED_EXTENSIONS) {
    const filePath = join(tempDir, `${id}${ext}`);
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}
