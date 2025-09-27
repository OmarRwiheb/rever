#!/bin/bash

# Video Compression Script for Tag Website
# This script compresses the large video files to improve loading performance

echo "Starting video compression..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it first:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Create backup directory
mkdir -p public/vid/backup
echo "Created backup directory: public/vid/backup"

# Backup original files
echo "Backing up original files..."
cp public/vid/main_desktop.mp4 public/vid/backup/
cp public/vid/main.mp4 public/vid/backup/
cp public/vid/secondary.mp4 public/vid/backup/

# Compress main desktop video (target: ~6MB)
echo "Compressing main_desktop.mp4..."
ffmpeg -i public/vid/main_desktop.mp4 \
  -c:v libx264 \
  -crf 28 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -y \
  public/vid/main_desktop_compressed.mp4

# Compress main mobile video (target: ~3MB)
echo "Compressing main.mp4..."
ffmpeg -i public/vid/main.mp4 \
  -c:v libx264 \
  -crf 30 \
  -preset medium \
  -c:a aac \
  -b:a 96k \
  -movflags +faststart \
  -vf "scale=720:-1" \
  -y \
  public/vid/main_compressed.mp4

# Compress secondary video (target: ~1.5MB)
echo "Compressing secondary.mp4..."
ffmpeg -i public/vid/secondary.mp4 \
  -c:v libx264 \
  -crf 32 \
  -preset medium \
  -c:a aac \
  -b:a 64k \
  -movflags +faststart \
  -y \
  public/vid/secondary_compressed.mp4

echo ""
echo "Compression complete! File sizes:"
echo "Original files:"
ls -lh public/vid/backup/*.mp4
echo ""
echo "Compressed files:"
ls -lh public/vid/*compressed.mp4

echo ""
echo "To use the compressed videos:"
echo "1. Replace the original files with compressed versions:"
echo "   mv public/vid/main_desktop_compressed.mp4 public/vid/main_desktop.mp4"
echo "   mv public/vid/main_compressed.mp4 public/vid/main.mp4"
echo "   mv public/vid/secondary_compressed.mp4 public/vid/secondary.mp4"
echo ""
echo "2. Test the website to ensure videos still look good"
echo "3. If satisfied, you can delete the backup files:"
echo "   rm -rf public/vid/backup"
