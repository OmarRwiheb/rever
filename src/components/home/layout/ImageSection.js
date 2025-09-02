import Image from "next/image";

export default function ImageSection({ src, alt }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        priority           // <— fetch early
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      {/* hero content overlay */}
    </div>
  );
}
