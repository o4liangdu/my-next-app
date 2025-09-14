#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const VIDEOS_DIR = path.join(__dirname, '..', 'public', 'videos');
const TARGET_SIZE_MB = 50; // Target size in MB
const MAX_HEIGHT = 480; // Maximum height in pixels

// Function to get file size in MB
function getFileSizeMb(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

// Function to get video information
function getVideoInfo(inputPath) {
  try {
    // Get video information
    const infoCmd = `ffprobe -v error -show_entries format=duration:stream=width,height -of default=noprint_wrappers=1:nokey=0 "${inputPath}"`;
    const infoOutput = execSync(infoCmd, { encoding: 'utf8' }).trim();
    
    const lines = infoOutput.split('\n');
    let duration = 0;
    let width = 0;
    let height = 0;
    
    lines.forEach(line => {
      if (line.startsWith('duration=')) {
        duration = parseFloat(line.split('=')[1]);
      } else if (line.startsWith('width=')) {
        width = parseInt(line.split('=')[1]);
      } else if (line.startsWith('height=')) {
        height = parseInt(line.split('=')[1]);
      }
    });
    
    return { duration, width, height };
  } catch (error) {
    console.error(`Error getting video info for ${inputPath}:`, error.message);
    return null;
  }
}

// Function to compress video using ffmpeg with resolution reduction
function compressVideo(inputPath, outputPath, targetSizeMb) {
  try {
    // Get video information
    const videoInfo = getVideoInfo(inputPath);
    if (!videoInfo) {
      return false;
    }
    
    const { duration, width, height } = videoInfo;
    
    if (isNaN(duration) || duration <= 0) {
      console.error(`Could not determine duration for ${inputPath}`);
      return false;
    }
    
    // Calculate target bitrate (in kbps)
    // Formula: (target_size_mb * 8192) / duration_seconds - audio_bitrate
    const targetBitrate = Math.floor((targetSizeMb * 8192) / duration - 128);
    
    // Ensure minimum video bitrate
    const videoBitrate = Math.max(targetBitrate, 300); // Lower minimum for 480p
    
    // Calculate new dimensions maintaining aspect ratio
    let newWidth = width;
    let newHeight = height;
    
    if (height > MAX_HEIGHT) {
      const ratio = MAX_HEIGHT / height;
      newHeight = MAX_HEIGHT;
      newWidth = Math.floor(width * ratio / 2) * 2; // Ensure even dimensions
    }
    
    console.log(`Original resolution: ${width}x${height}`);
    console.log(`New resolution: ${newWidth}x${newHeight}`);
    console.log(`Target bitrate: ${videoBitrate}k`);
    
    // Build ffmpeg command based on file extension
    let compressCmd;
    const ext = path.extname(inputPath).toLowerCase();
    
    if (ext === '.webm') {
      // For WebM files, use VP9 codec
      compressCmd = `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -b:v ${videoBitrate}k -crf 32 -c:a libopus -b:a 96k -vf "scale=${newWidth}:${newHeight}" -y "${outputPath}"`;
    } else {
      // For other formats, use H.264 codec
      compressCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -b:v ${videoBitrate}k -crf 28 -c:a aac -b:a 96k -vf "scale=${newWidth}:${newHeight}" -y "${outputPath}"`;
    }
    
    console.log(`Compressing ${path.basename(inputPath)}...`);
    console.log(`Command: ${compressCmd}`);
    
    execSync(compressCmd, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error(`Error compressing ${inputPath}:`, error.message);
    return false;
  }
}

// Function to process all videos in the directory
function processVideos() {
  // Check if videos directory exists
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error('Videos directory not found:', VIDEOS_DIR);
    return;
  }
  
  // Read all files in the videos directory
  const files = fs.readdirSync(VIDEOS_DIR);
  
  // Filter for video files
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
  });
  
  if (videoFiles.length === 0) {
    console.log('No video files found in the videos directory');
    return;
  }
  
  console.log(`Found ${videoFiles.length} video files to process`);
  
  // Process each video file
  videoFiles.forEach(file => {
    const inputPath = path.join(VIDEOS_DIR, file);
    const tempPath = path.join(VIDEOS_DIR, `temp_${file}`);
    
    const fileSizeMb = getFileSizeMb(inputPath);
    console.log(`\nProcessing: ${file} (${fileSizeMb.toFixed(2)} MB)`);
    
    // If file is already smaller than target, skip compression
    if (fileSizeMb <= TARGET_SIZE_MB) {
      console.log(`File is already smaller than ${TARGET_SIZE_MB}MB, skipping compression...`);
      return;
    }
    
    // Compress the video to temp file
    const success = compressVideo(inputPath, tempPath, TARGET_SIZE_MB);
    if (success) {
      const compressedSizeMb = getFileSizeMb(tempPath);
      
      // Only replace original if compression was successful and file is smaller
      if (compressedSizeMb < fileSizeMb) {
        // Replace original file with compressed version
        fs.renameSync(tempPath, inputPath);
        const finalSizeMb = getFileSizeMb(inputPath);
        const reduction = ((fileSizeMb - finalSizeMb) / fileSizeMb * 100).toFixed(1);
        console.log(`Compression successful: ${finalSizeMb.toFixed(2)} MB (${reduction}% reduction)`);
      } else {
        // If compressed file is larger, keep original and remove temp file
        fs.unlinkSync(tempPath);
        console.log(`Compression resulted in larger file, keeping original...`);
      }
    } else {
      // If compression failed, remove temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      console.log(`Compression failed, keeping original file...`);
    }
  });
  
  console.log('\nVideo compression complete!');
  console.log(`Videos have been compressed in place in: ${VIDEOS_DIR}`);
}

// Run the script
console.log('Video Compression Script');
console.log('======================');
console.log(`Target size: ${TARGET_SIZE_MB}MB`);
console.log(`Max resolution: ${MAX_HEIGHT}p`);
console.log('');

processVideos();