import Image from "next/image";

export default function ImageSection({ src, alt, priority = false, overlayText }) {
  return (
    <div 
      className="relative w-full h-full"
      style={{
        // Force GPU layer without transform
        willChange: priority ? "auto" : "transform",
        contain: "layout style paint",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        // More granular sizes for better iPhone optimization
        sizes="(max-width: 390px) 390px,
               (max-width: 428px) 428px,
               (max-width: 768px) 768px,
               (max-width: 1024px) 1024px,
               1920px"
        quality={85} // Reduce from default 100 - imperceptible on mobile
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg=="
        className="object-cover"
        style={{
          // Critical for Safari/iOS performance
          objectFit: "cover",
          objectPosition: "center",
          // Prevent Safari rendering issues
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          WebkitTransform: "translate3d(0,0,0)",
          transform: "translate3d(0,0,0)",
        }}
        // CRITICAL: NO lazy loading during scroll animations
        loading="eager"
        // Disable optimization for better Safari compatibility
        unoptimized={false}
      />
      
      {/* Overlay Text */}
      {overlayText && (
        <div className="absolute bottom-0 left-0 right-0  p-4">
          <p className="text-white font-montserrat-regular text-sm text-center">
            {overlayText}
          </p>
        </div>
      )}
    </div>
  );
}