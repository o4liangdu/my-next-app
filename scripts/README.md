# Video Compression Scripts

This directory contains scripts to compress videos in the `public/videos` directory to keep them under 50MB for better web performance. Videos are compressed in-place and resized to a maximum height of 480p.

## Available Scripts

### Node.js Script
```bash
npm run compress-videos
```

### Bash Script
```bash
npm run compress-videos-bash
```

## How It Works

1. The scripts scan the `public/videos` directory for video files
2. For each video larger than 50MB, it compresses the video using ffmpeg
3. Videos are resized to a maximum height of 480p while maintaining aspect ratio
4. Videos smaller than 50MB are left unchanged
5. Compressed videos replace the original files in the same directory

## Requirements

- ffmpeg must be installed on your system
- ffprobe (usually installed with ffmpeg) is required for video analysis
- bc (basic calculator) is required for the bash script

## Compression Settings

- Target size: 50MB maximum
- Maximum resolution: 480p height
- Video codecs:
  - H.264 for MP4, MOV, AVI, MKV files
  - VP9 for WebM files
- Audio codec: AAC for most formats, Opus for WebM
- Audio bitrate: 96kbps
- Video bitrate: Automatically calculated based on video duration to meet target size

## Usage

1. Place your videos in `public/videos`
2. Run one of the compression scripts above
3. Compressed videos will replace the original files in `public/videos`

## Features

- **Format support**: Works with MP4, MOV, AVI, MKV, and WebM files
- **Resolution reduction**: Automatically scales videos to 480p maximum height
- **In-place compression**: Compressed files replace originals directly
- **Safety checks**: Only replaces original if compressed file is smaller
- **Error handling**: Gracefully handles errors and preserves originals on failure