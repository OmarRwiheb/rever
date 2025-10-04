"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";

const OptimizedVideoSection = memo(function OptimizedVideoSection({
  src,
  mobileSrc,
  poster,
  priority = false,
  isActive = true,
  className = "w-full h-full object-cover"
}) {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect mobile once on mount with proper SSR handling
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Play/pause based on visibility - optimized with useCallback
  useEffect(() => {
    if (!mounted) return;
    
    const v = videoRef.current;
    if (!v) return;
    
    if (isActive) {
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      v.pause();
    }
  }, [isActive, mounted]);

  // Memoize video source to prevent unnecessary re-renders
  const videoSrc = useMemo(() => {
    if (!mounted) return mobileSrc || src; // Return mobile src during SSR if available
    return (isMobile && mobileSrc) ? mobileSrc : src;
  }, [isMobile, mobileSrc, src, mounted]);

  // Optimize preload based on priority and mobile
  const optimizedPreload = useMemo(() => {
    if (!mounted) return "none"; // Don't preload during SSR
    if (priority) return isMobile ? "metadata" : "auto"; // Less aggressive on mobile even for priority
    return "none"; // No preloading for non-priority videos
  }, [mounted, priority, isMobile]);


  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full bg-gray-900 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted
        playsInline
        loop
        preload={optimizedPreload}
        poster={poster}
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        src={videoSrc}
        style={{
          // Optimize for better performance
          willChange: isActive ? "transform" : "auto",
          contain: "layout style paint",
        }}
      />
      
      {/* Scroll Down Overlay - only show for hero video (priority=true) */}
      {priority && (
        <div className="absolute top-[90dvh] left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <div className="flex flex-col items-center space-y-3">
            <span className="text-white text-xs tracking-[0.2em] uppercase leading-relaxed">
              Women's fall 2025              
            </span>
            <svg 
              className="w-4 h-4 text-white opacity-80" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ strokeWidth: 1.5 }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 9l6 6 6-6" 
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});

export default OptimizedVideoSection;