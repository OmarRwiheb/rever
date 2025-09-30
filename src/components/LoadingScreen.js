'use client';

export default function LoadingScreen({ message = "Loading...", fullScreen = true, className = "" }) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 w-screen h-screen overflow-hidden bg-black z-20 flex items-center justify-center"
    : "flex items-center justify-center py-20";

  return (
    <div className={`${containerClasses} ${className}`}>
      <p className="text-white font-awaken text-xl">{message}</p>
    </div>
  );
}
