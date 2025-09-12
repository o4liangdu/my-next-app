import fs from 'fs';
import path from 'path';

// Function to get video files from the public/videos directory
export async function getVideoFiles() {
  const videosDir = path.join(process.cwd(), 'public', 'videos');
  
  // Check if directory exists
  if (!fs.existsSync(videosDir)) {
    return [];
  }
  
  // Read files from directory
  const files = fs.readdirSync(videosDir);
  
  // Filter for video files
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
  });
  
  // Create video objects with basic info
  const videos = videoFiles.map((file, index) => {
    const filePath = path.join('/videos', file);
    const name = path.basename(file, path.extname(file));
    
    return {
      id: `video-${index + 1}`,
      title: name,
      channel: 'Local Videos',
      views: `${Math.floor(Math.random() * 1000) + 1}K views`,
      timestamp: `${Math.floor(Math.random() * 30) + 1} days ago`,
      duration: '00:00', // We'll update this with actual duration
      thumbnail: '/globe.svg', // Default thumbnail
      videoUrl: filePath
    };
  });
  
  return videos;
}