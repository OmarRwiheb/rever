'use client';

import { useState, useRef, useEffect } from 'react';

export default function OptimizedVideoSection({ 
  src, 
  poster, 
  mobileSrc, 
  priority = false,
  className = "w-full h-full object-cover"
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading (skip if priority)
  useEffect(() => {
    if (priority) {
      console.log('Priority video, loading immediately:', src);
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log('Video entering viewport:', src);
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, src]);

  const handleLoadStart = () => {
    console.log('Video load started:', src);
    setIsLoading(true);
    setLoadProgress(0);
    setHasError(false);
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    }
  };

  const handleCanPlay = () => {
    console.log('Video can play:', src);
    setIsLoaded(true);
    setIsLoading(false);
    // Force play the video
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Video failed to load:', src);
  };

  // Determine which video source to use based on screen size
  const getVideoSrc = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 && mobileSrc ? mobileSrc : src;
    }
    return src;
  };

  // Preload strategy based on priority
  const getPreloadStrategy = () => {
    if (priority) return 'auto';
    return 'metadata';
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Loading video...</div>
            <div className="w-32 bg-gray-600 rounded-full h-1 mt-2">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <div className="text-sm">Video unavailable</div>
          </div>
        </div>
      )}

      {/* Video element */}
      {isInView && !hasError && (
        <video
          ref={videoRef}
          className={className}
          autoPlay
          muted
          loop
          playsInline
          preload={getPreloadStrategy()}
          onLoadStart={handleLoadStart}
          onProgress={handleProgress}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onLoadedData={() => {
            // Ensure video plays when data is loaded
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
        >
          <source src={getVideoSrc()} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
            <p>Video not supported</p>
          </div>
        </video>
      )}

      {/* Placeholder when no poster and video not loaded */}
      {(!isLoaded || hasError) && !poster && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
}
