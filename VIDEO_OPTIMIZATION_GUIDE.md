# Video Optimization Guide

## Current Issue
The videos on your home page are very large (28.5MB each) causing slow loading times and showing Chrome's loading bar constantly.

## Immediate Solutions Implemented

### 1. Lazy Loading
- Videos only load when they come into viewport
- Reduces initial page load time significantly

### 2. Loading States
- Added loading spinners and progress bars
- Users see immediate feedback while videos load

### 3. Poster Images
- Show poster images instantly while videos load
- Better user experience with immediate visual content

### 4. Responsive Video Sources
- Different video files for mobile vs desktop
- Smaller files for mobile devices

## Recommended Video Compression

### Current File Sizes
- `main_desktop.mp4`: 28.5MB
- `main.mp4`: 28.5MB
- `secondary.mp4`: 5.9MB

### Target File Sizes (Recommended)
- Desktop videos: 5-8MB max
- Mobile videos: 2-4MB max
- Secondary videos: 1-2MB max

### Compression Commands

#### For Desktop Videos (main_desktop.mp4)
```bash
ffmpeg -i main_desktop.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart main_desktop_optimized.mp4
```

#### For Mobile Videos (main.mp4)
```bash
ffmpeg -i main.mp4 -c:v libx264 -crf 30 -preset medium -c:a aac -b:a 96k -movflags +faststart -vf "scale=720:-1" main_mobile_optimized.mp4
```

#### For Secondary Videos (secondary.mp4)
```bash
ffmpeg -i secondary.mp4 -c:v libx264 -crf 32 -preset medium -c:a aac -b:a 64k -movflags +faststart secondary_optimized.mp4
```

### Compression Parameters Explained
- `crf 28-32`: Quality level (lower = better quality, higher = smaller file)
- `preset medium`: Encoding speed vs compression efficiency
- `b:a 128k`: Audio bitrate
- `movflags +faststart`: Enables progressive download
- `scale=720:-1`: Resize for mobile (720p width, auto height)

## Additional Optimizations

### 1. WebM Format
Consider creating WebM versions for better compression:
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus output.webm
```

### 2. Multiple Resolutions
Create different versions for different screen sizes:
- Desktop: 1920x1080
- Tablet: 1280x720
- Mobile: 720x480

### 3. Preload Strategy
- Hero video: `preload="auto"` (loads immediately)
- Other videos: `preload="metadata"` (loads only metadata)

## Implementation Status
✅ Lazy loading implemented
✅ Loading states added
✅ Poster images configured
✅ Responsive video sources set up
✅ Error handling added

## Next Steps
1. Compress existing video files using the commands above
2. Replace current videos with optimized versions
3. Test loading performance
4. Consider implementing WebM format for better browser support
