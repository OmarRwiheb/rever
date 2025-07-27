export default function VideoSection({ src }) {
    return (
      <div className="w-full h-full relative bg-black">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  