export default function VideoSection({ src }) {
  return (
    <div className="relative w-full h-full">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"      // <— quick metadata fetch, no big stall
        // poster="img/men.jpg" // <— shows instantly while video buffers
      >
        {/* <source src="/hero.webm" type="video/webm" /> */}
        <source src={src} type="video/mp4" />
      </video>
      {/* overlay UI */}
    </div>
  );
}