'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoList from '@/components/VideoList';

interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export default function WatchPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch video data from API
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data.videos);
        if (data.videos.length > 0) {
          setCurrentVideo(data.videos[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-xl">Loading videos...</div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-xl">No videos found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Video Player</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-black rounded-lg overflow-hidden">
              <VideoPlayer 
                video={currentVideo} 
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
              />
            </div>
            
            {/* Video Info */}
            <div className="mt-4">
              <h2 className="text-xl font-bold">{currentVideo.title}</h2>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-gray-400">{currentVideo.channel}</p>
                  <p className="text-gray-500 text-sm">
                    {currentVideo.views} views • {currentVideo.timestamp}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full">
                    <span>👍</span>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full">
                    <span>👎</span>
                  </button>
                  <button className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full">
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video List */}
          <div className="lg:w-1/3">
            <VideoList 
              videos={videos} 
              currentVideoId={currentVideo.id}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}