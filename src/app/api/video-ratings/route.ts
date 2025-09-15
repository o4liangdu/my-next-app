import { NextResponse } from 'next/server';
import { getVideoRatings, updateVideoRating } from '@/lib/videoRatings';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    const ratings = await getVideoRatings(videoId);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching video ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch video ratings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { videoId, action } = await request.json();
    
    if (!videoId || !action) {
      return NextResponse.json({ error: 'Video ID and action are required' }, { status: 400 });
    }
    
    if (action !== 'like' && action !== 'dislike') {
      return NextResponse.json({ error: 'Action must be either "like" or "dislike"' }, { status: 400 });
    }
    
    const ratings = await updateVideoRating(videoId, action);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error updating video ratings:', error);
    return NextResponse.json({ error: 'Failed to update video ratings' }, { status: 500 });
  }
}