import Image from "next/image";
import { memo, useMemo } from "react";

const ImageSection = memo(function ImageSection({ src, alt, priority = false, overlayText }) {
  // Memoize quality based on priority for better performance
  const imageQuality = useMemo(() => priority ? 90 : 75, [priority]);

  return (
    <div 
      className="relative w-full h-full"
      style={{
        // Optimized GPU layer management
        willChange: priority ? "auto" : "transform",
        contain: "layout style paint",
        // Black background to match dark theme and prevent white flash
        backgroundColor: "#000000",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        // Optimized sizes for mobile performance
        sizes="(max-width: 390px) 390px,
               (max-width: 428px) 428px,
               (max-width: 768px) 768px,
               (max-width: 1024px) 1024px,
               1920px"
        quality={imageQuality}
        placeholder="empty"
        className="object-cover"
        style={{
          // Essential Safari/iOS performance optimizations
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
        // Eager loading for scroll animations
        loading="eager"
        // Keep optimization enabled for better performance
        unoptimized={false}
        // Add error handling
        onError={(e) => {
          console.warn(`Failed to load image: ${src}`);
          e.target.style.display = 'none';
        }}
      />
      
      {/* Overlay Text - Memoized to prevent re-renders */}
      {overlayText && (
        <div className="absolute top-[92dvh] left-0 right-0 p-4">
          <p className="text-white font-montserrat-regular text-sm text-center">
            {overlayText}
          </p>
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
ImageSection.displayName = 'ImageSection';

export default ImageSection;