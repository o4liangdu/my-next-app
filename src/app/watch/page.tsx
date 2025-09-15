"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import VideoList from "@/components/VideoList";

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

export default function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");

  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoRatings, setVideoRatings] = useState({ likes: 0, dislikes: 0 });
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    // Fetch video data from API
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        setVideos(data.videos);

        // Check if a specific video ID is requested via URL parameter
        if (videoId && data.videos.length > 0) {
          const requestedVideo = data.videos.find(
            (video: Video) => video.id === videoId
          );
          if (requestedVideo) {
            setCurrentVideo(requestedVideo);
            // Don't auto-play due to browser autoplay policies
            // setIsPlaying(true); // Auto-play the requested video
          } else {
            // Fallback to first video if requested video not found
            setCurrentVideo(data.videos[0]);
          }
        } else if (data.videos.length > 0) {
          // Default to first video if no specific video requested
          setCurrentVideo(data.videos[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, [videoId]);

  // Fetch video ratings when currentVideo changes
  useEffect(() => {
    const fetchRatings = async () => {
      if (currentVideo) {
        try {
          const response = await fetch(
            `/api/video-ratings?videoId=${currentVideo.id}`
          );
          const ratings = await response.json();
          setVideoRatings(ratings);
        } catch (error) {
          console.error("Error fetching video ratings:", error);
        }
      }
    };

    fetchRatings();
  }, [currentVideo]);

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setUserRating(null); // Reset user rating when switching videos
  };

  const handleShare = async () => {
    try {
      if (!currentVideo) return;
      const url =
        typeof window !== "undefined"
          ? window.location.origin + "/watch?v=" + currentVideo.id
          : "";

      // Check if clipboard API is available
      if (
        typeof navigator.clipboard !== "undefined" &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Failed to copy link to clipboard.");
    }
  };

  const handleLike = async () => {
    if (!currentVideo || userRating) return;
    try {
      const response = await fetch("/api/video-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: currentVideo.id,
          action: "like",
        }),
      });
      const updatedRatings = await response.json();
      setVideoRatings(updatedRatings);
      setUserRating("like");
    } catch (error) {
      console.error("Error updating video ratings:", error);
    }
  };

  const handleDislike = async () => {
    if (!currentVideo || userRating) return;
    try {
      const response = await fetch("/api/video-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: currentVideo.id,
          action: "dislike",
        }),
      });
      const updatedRatings = await response.json();
      setVideoRatings(updatedRatings);
      setUserRating("dislike");
    } catch (error) {
      console.error("Error updating video ratings:", error);
    }
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
                    {currentVideo.views} views
                  </p>
                  <p className="text-gray-500 text-sm">
                    upload on {currentVideo.timestamp}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${
                      userRating === "like"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={handleLike}
                    disabled={userRating === "like"}
                  >
                    <span>👍</span>
                    <span>Like ({videoRatings.likes})</span>
                  </button>
                  <button
                    className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${
                      userRating === "dislike"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={handleDislike}
                    disabled={userRating === "dislike"}
                  >
                    <span>👎</span>
                    <span>Dislike ({videoRatings.dislikes})</span>
                  </button>
                  <button
                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full cursor-pointer"
                    onClick={handleShare}
                  >
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
