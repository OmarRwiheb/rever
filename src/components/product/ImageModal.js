import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ImageModal({ isOpen, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [clickStart, setClickStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Reset zoom and position when changing images
  useEffect(() => {
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle mouse wheel for image navigation
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scroll down - next image
      setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    } else {
      // Scroll up - previous image
      setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    }
  };

  // Handle click to zoom in/out
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if mouse actually moved (drag vs click)
    const mouseMoved = Math.abs(e.clientX - clickStart.x) > 5 || Math.abs(e.clientY - clickStart.y) > 5;
    
    if (isZoomed) {
      // Only zoom out if it was a clean click, not a drag
      if (!mouseMoved) {
        setIsZoomed(false);
        setImagePosition({ x: 0, y: 0 });
      }
    } else {
      // Zoom in on any click
      setIsZoomed(true);
    }
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    if (isZoomed) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
    // Record click start position for all mouse downs
    setClickStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging && isZoomed) {
      e.preventDefault();
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && isZoomed) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && isZoomed) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isZoomed) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isZoomed, isDragging, dragStart]);

  if (!isOpen) return null;

  // Create portal content
  const modalContent = (
    <div 
      className="fixed inset-0 bg-white flex flex-col"
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backgroundColor: 'white'
      }}
    >
      {/* Main image area - Center */}
      <div className="flex-1 flex items-center justify-center relative p-6" style={{ zIndex: 2147483647, minHeight: 0 }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black text-2xl hover:text-gray-600 z-10"
        >
          ✕
        </button>

        {/* Main image container */}
        <div 
          ref={imageRef}
          className="relative w-full h-full overflow-hidden rounded-lg"
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
          }}
        >
          <style jsx>{`
            img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
              image-rendering: high-quality;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            /* Mobile touch optimizations */
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Prevent zoom on double-tap */
            * {
              touch-action: pan-x pan-y;
            }
          `}</style>
          <Image
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            width={2400}
            height={1600}
            className="object-contain w-full h-full"
            style={{
              transform: isZoomed ? `scale(2) translate(${imagePosition.x / 2}px, ${imagePosition.y / 2}px)` : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              transformOrigin: 'center center',
              imageRendering: 'high-quality',
              willChange: 'transform'
            }}
            priority
            quality={100}
          />
        </div>
      </div>

      {/* Thumbnail navigation - Bottom */}
      <div className="h-20 bg-gray-50 border-t border-gray-200 overflow-x-auto p-4 flex items-center justify-center space-x-3" style={{ zIndex: 2147483647 }}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            className={`w-14 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
              index === currentIndex ? 'border-black scale-105' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );

  // Render using portal to document.body
  return createPortal(modalContent, document.body);
}
