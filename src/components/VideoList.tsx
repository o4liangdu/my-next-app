'use client';

interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  size: string;
  thumbnail: string;
  videoUrl: string;
}

interface VideoListProps {
  videos: Video[];
  currentVideoId: string;
  onVideoSelect: (video: Video) => void;
}

export default function VideoList({ videos, currentVideoId, onVideoSelect }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-2">Up Next</h3>
        <div className="text-gray-400 text-center py-8">
          No videos found in the public/videos directory
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-2">Up Next</h3>
      {videos.map((video) => (
        <div
          key={video.id}
          className={`flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
            currentVideoId === video.id ? 'bg-gray-800 border-l-4 border-red-600' : ''
          }`}
          onClick={() => onVideoSelect(video)}
        >
          {/* Thumbnail */}
          <div className="relative w-40 h-24 flex-shrink-0">
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="bg-gray-600 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
          </div>
          
          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
            <p className="text-gray-400 text-xs mt-1">{video.channel}</p>
            <p className="text-gray-500 text-xs">
              {video.views} views
            </p>
            <p className="text-gray-500 text-xs">
              {video.timestamp}
            </p>
            <p className="text-gray-500 text-xs">
              {video.size}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}