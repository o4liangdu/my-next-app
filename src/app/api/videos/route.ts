import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    
    // Check if directory exists
    if (!fs.existsSync(videosDir)) {
      return NextResponse.json({ videos: [] });
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
        duration: '00:00', // In a real app, this would be actual duration
        thumbnail: '/globe.svg', // Default thumbnail
        videoUrl: filePath
      };
    });
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error reading video files:', error);
    return NextResponse.json({ videos: [] });
  }
}