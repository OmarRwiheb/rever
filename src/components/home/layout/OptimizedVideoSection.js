"use client";

import { useEffect, useRef, useState } from "react";

export default function OptimizedVideoSection({
  src,
  mobileSrc,
  poster,
  priority = false,
  isActive = true,
  className = "w-full h-full object-cover"
}) {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile once on mount
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Play/pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive]);

  const preload = priority ? "auto" : "metadata";
  const videoSrc = (isMobile && mobileSrc) ? mobileSrc : src;

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted
        playsInline
        loop
        preload={preload}
        poster={poster}
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        src={videoSrc}
      />
    </div>
  );
}