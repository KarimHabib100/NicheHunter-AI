import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processUploadedFile } from '@/lib/video/upload';
import { getVideoMetadata } from '@/lib/video/process';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
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

export const config = {
  api: {
    bodyParser: false,
  },
};
