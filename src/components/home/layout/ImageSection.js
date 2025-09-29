import Image from "next/image";

export default function ImageSection({ src, alt, priority = false }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}           // ✅ only for the top hero
        fetchPriority={priority ? "high" : "auto"}
        // Ship smaller images to iPhone instead of always 100vw@full-res
        sizes="(max-width: 640px) 100vw,
               (max-width: 1024px) 100vw,
               100vw"
        className="object-cover"
      />
    </div>
  );
}
