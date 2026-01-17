import { NextRequest, NextResponse } from 'next/server';
import { getUnreviewedReplies, getReplies, updateReplyRating } from '@/lib/x-reply-guy-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const limit = parseInt(searchParams.get('limit') || '100');

    let replies;
    if (filter === 'unreviewed') {
      replies = getUnreviewedReplies(limit);
    } else {
      replies = getReplies(limit);
    }

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('School GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, rating, comment } = await request.json();

    if (!id || !rating) {
      return NextResponse.json({ error: 'Missing id or rating' }, { status: 400 });
    }

    updateReplyRating(id, rating, comment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('School POST error:', error);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
