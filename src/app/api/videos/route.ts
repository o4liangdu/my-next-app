import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { r2Config } from '@/lib/r2Config';

// Configure AWS SDK for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  accessKeyId: r2Config.accessKeyId,
  secretAccessKey: r2Config.secretAccessKey,
  signatureVersion: 'v4',
});

export async function GET() {
  try {
    // List objects from R2 bucket
    const data = await s3.listObjectsV2({ 
      Bucket: r2Config.bucketName 
    }).promise();
    console.log(data, 111)
    
    // Filter for video files
    const videoFiles = data.Contents?.filter(file => {
      if (!file.Key) return false;
      const ext = file.Key.substring(file.Key.lastIndexOf('.')).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
    }) || [];
    
    // Create video objects with basic info
    const videos = videoFiles.map((file, index) => {
      const fileName = file.Key || '';
      const name = fileName.substring(0, fileName.lastIndexOf('.'));
      
      // Format file size
      const sizeInMB = file.Size ? (file.Size / (1024 * 1024)).toFixed(2) : '0';
      
      // Format last modified date
      const lastModified = file.LastModified ? new Date(file.LastModified).toLocaleDateString() : 'Unknown';
      
      return {
        id: `video-${index + 1}`,
        title: name,
        channel: 'liangdo Videos',
        views: `${Math.floor(Math.random() * 1000) + 1}K views`,
        timestamp: lastModified,
        size: `${sizeInMB} MB`,
        thumbnail: '/globe.svg', // Default thumbnail - can be replaced with video first frame later
        videoUrl: `https://cfr2-videos.liangdo18.qzz.io/${fileName}`
      };
    });
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos from R2:', error);
    return NextResponse.json({ videos: [] });
  }
}