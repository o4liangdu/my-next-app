#!/bin/bash

# Video Compression Script
# Compresses videos in public/videos to keep them under 50MB and reduce resolution to 480p

VIDEOS_DIR="./public/videos"
TARGET_SIZE_MB=50
MAX_HEIGHT=480

echo "Video Compression Script"
echo "======================"
echo "Target size: ${TARGET_SIZE_MB}MB"
echo "Max resolution: ${MAX_HEIGHT}p"
echo ""

# Check if videos directory exists
if [ ! -d "$VIDEOS_DIR" ]; then
  echo "Error: Videos directory not found: $VIDEOS_DIR"
  exit 1
fi

# Process each video file
for file in "$VIDEOS_DIR"/*.{mp4,mov,avi,mkv,webm}; do
  # Check if file exists (in case no files match the pattern)
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    temp_file="$VIDEOS_DIR/temp_$filename"
    
    # Get file size in MB
    file_size_mb=$(du -m "$file" | cut -f1)
    
    echo "Processing: $filename (${file_size_mb}MB)"
    
    # If file is already smaller than target, skip compression
    if [ "$file_size_mb" -le "$TARGET_SIZE_MB" ]; then
      echo "File is already smaller than ${TARGET_SIZE_MB}MB, skipping compression..."
      echo ""
      continue
    fi
    
    # Get video information
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file")
    width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=s=x:p=0 "$file")
    height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=s=x:p=0 "$file")
    
    if [ -n "$duration" ] && [ "$duration" != "N/A" ] && [ -n "$width" ] && [ -n "$height" ]; then
      # Calculate new dimensions maintaining aspect ratio
      new_width=$width
      new_height=$height
      
      if [ "$height" -gt "$MAX_HEIGHT" ]; then
        ratio=$(echo "scale=4; $MAX_HEIGHT / $height" | bc)
        new_height=$MAX_HEIGHT
        new_width=$(echo "scale=0; $width * $ratio / 1" | bc)
        # Ensure even dimensions
        new_width=$(( (new_width / 2) * 2 ))
      fi
      
      echo "Original resolution: ${width}x${height}"
      echo "New resolution: ${new_width}x${new_height}"
      
      # Calculate target bitrate (in kbps)
      # Formula: (target_size_mb * 8192) / duration_seconds - audio_bitrate
      audio_bitrate=96
      target_bitrate=$(echo "scale=0; ($TARGET_SIZE_MB * 8192) / ${duration%.*} - $audio_bitrate" | bc)
      
      # Ensure minimum video bitrate
      if [ "$target_bitrate" -lt 300 ]; then
        target_bitrate=300
      fi
      
      echo "Target bitrate: ${target_bitrate}k"
      
      # Build ffmpeg command based on file extension
      ext="${file##*.}"
      if [ "$ext" = "webm" ]; then
        # For WebM files, use VP9 codec
        compress_cmd="ffmpeg -i \"$file\" -c:v libvpx-vp9 -b:v ${target_bitrate}k -crf 32 -c:a libopus -b:a 96k -vf \"scale=${new_width}:${new_height}\" -y \"$temp_file\""
      else
        # For other formats, use H.264 codec
        compress_cmd="ffmpeg -i \"$file\" -c:v libx264 -b:v ${target_bitrate}k -crf 28 -c:a aac -b:a 96k -vf \"scale=${new_width}:${new_height}\" -y \"$temp_file\""
      fi
      
      echo "Compressing with command: $compress_cmd"
      
      # Compress video using ffmpeg
      eval $compress_cmd
      
      # Check if compression was successful
      if [ -f "$temp_file" ]; then
        compressed_size_mb=$(du -m "$temp_file" | cut -f1)
        
        # Only replace original if compressed file is smaller
        if [ "$compressed_size_mb" -lt "$file_size_mb" ]; then
          mv "$temp_file" "$file"
          final_size_mb=$(du -m "$file" | cut -f1)
          reduction_percent=$(( (file_size_mb - final_size_mb) * 100 / file_size_mb ))
          echo "Compression successful: ${final_size_mb}MB (${reduction_percent}% reduction)"
        else
          # If compressed file is larger, keep original and remove temp file
          rm "$temp_file"
          echo "Compression resulted in larger file, keeping original..."
        fi
      else
        echo "Compression failed, keeping original file..."
      fi
    else
      echo "Error: Could not determine video information for $filename"
    fi
    
    echo ""
  fi
done

echo "Video compression complete!"
echo "Videos have been compressed in place in: $VIDEOS_DIR"