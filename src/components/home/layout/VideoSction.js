"use client";
import { useEffect, useRef, useState } from "react";

export default function LazyVideoSection({ src, mobileSrc, poster, className }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.15, rootMargin: "100px" }); // preload slightly early
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !videoRef.current) return;
    videoRef.current.play().catch(() => {});
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full h-full">
      {inView && (
        <video
          ref={videoRef}
          className={className || "w-full h-full object-cover"}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          controls={false}
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
        >
          {mobileSrc && (
            <source
              src={mobileSrc}
              media="(max-width: 768px)"
              type='video/mp4; codecs="avc1.4d401f"'
            />
          )}
          <source src={src} type='video/mp4; codecs="avc1.4d401f"' />
        </video>
      )}
    </div>
  );
}
