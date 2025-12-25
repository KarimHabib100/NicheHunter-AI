import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile } from '@/lib/video/upload';
import { getVideoMetadata } from '@/lib/video/process';

export async function POST(req: NextRequest) {
  try {
    // MVP: No auth required

    let formData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const uploadedFile = await processUploadedFile(formData);

    let duration = 0;
    try {
      const metadata = await getVideoMetadata(uploadedFile.path);
      duration = Math.round(metadata.duration);
    } catch (e) {
      console.warn('Could not extract video metadata');
    }

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        name: uploadedFile.originalName,
        size: uploadedFile.size,
        duration,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Note: In Next.js App Router, formData is handled natively - no config needed
