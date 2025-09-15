import clientPromise from '@/lib/mongodb';

interface VideoRating {
  videoId: string;
  likes: number;
  dislikes: number;
}

export async function getVideoRatings(videoId: string): Promise<VideoRating> {
  try {
    const client = await clientPromise;
    const db = client.db('video_app');
    const collection = db.collection<VideoRating>('video_ratings');
    
    const rating = await collection.findOne({ videoId });
    console.log('Rating:', rating);
    
    if (!rating) {
      // If no rating exists, create a new one with 0 likes and dislikes
      const newRating: VideoRating = {
        videoId,
        likes: 0,
        dislikes: 0
      };
      await collection.insertOne(newRating);
      return newRating;
    }
    
    return rating;
  } catch (error) {
    console.error('Error fetching video ratings:', error);
    // Return default rating if there's an error
    return {
      videoId,
      likes: 0,
      dislikes: 0
    };
  }
}

export async function updateVideoRating(videoId: string, action: 'like' | 'dislike'): Promise<VideoRating> {
  try {
    const client = await clientPromise;
    const db = client.db('video_app');
    const collection = db.collection<VideoRating>('video_ratings');
    
    const updateQuery = action === 'like' 
      ? { $inc: { likes: 1 } } 
      : { $inc: { dislikes: 1 } };
    
    const result = await collection.findOneAndUpdate(
      { videoId },
      updateQuery,
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    if (result) {
      return result;
    } else {
      // If no document was found or updated, create a new one
      const newRating: VideoRating = {
        videoId,
        likes: action === 'like' ? 1 : 0,
        dislikes: action === 'dislike' ? 1 : 0
      };
      await collection.insertOne(newRating);
      return newRating;
    }
  } catch (error) {
    console.error('Error updating video rating:', error);
    // Return default rating if there's an error
    return {
      videoId,
      likes: 0,
      dislikes: 0
    };
  }
}