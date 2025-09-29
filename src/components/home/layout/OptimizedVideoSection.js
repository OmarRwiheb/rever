"use client";

import { useEffect, useRef } from "react";

export default function OptimizedVideoSection({
  src,                 // desktop / default src (mp4 h264)
  mobileSrc,           // mobile-optimized mp4 (<=1080p, lower bitrate)
  poster,              // jpg/webp preview
  priority = false,    // only true for the first fold
  isActive = true,     // 🔑 controls play/pause from parent
  className = "w-full h-full object-cover"
}) {
  const videoRef = useRef(null);

  // Play/pause based on visibility (from parent / GSAP index)
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

  // iOS: avoid chatty state; keep it simple & cheap
  // Preload only if priority; otherwise, just metadata
  const preload = priority ? "auto" : "metadata";

  return (
    <div className="relative w-full h-full">
      {/* Lightweight placeholder via poster; no animated overlays */}
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted
        playsInline
        loop
        preload={preload}
        poster={poster}
        // Prevent PIP UI / extras that can trigger compositing work on iOS
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
      >
        {/* iPhone will pick the first matching media */}
        {mobileSrc && (
          <source
            src={mobileSrc}
            media="(max-width: 768px)"
            type='video/mp4; codecs="avc1.4d401f"'
          />
        )}
        <source
          src={src}
          type='video/mp4; codecs="avc1.4d401f"'
        />
      </video>
    </div>
  );
}
