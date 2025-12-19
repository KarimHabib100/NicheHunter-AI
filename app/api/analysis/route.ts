import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAnalysesByUser, getAnalysisCount } from '@/lib/db/analysis';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [analyses, total] = await Promise.all([
      getAnalysesByUser(session.user.id, { limit, offset }),
      getAnalysisCount(session.user.id),
    ]);

    return NextResponse.json({
      analyses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + analyses.length < total,
      },
    });
  } catch (error) {
    console.error('List analyses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
