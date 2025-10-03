import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import ImageModal from './ImageModal';

export default function ProductImage({ product }) {
  // Use product images array or fallback to single image
  const productImages = product.images || [product.imageUrl];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const openModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Track scroll position and add snap-to-image functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || productImages.length <= 1) return;

    let isScrolling = false;
    let scrollTimeout = null;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        container.style.scrollBehavior = 'auto';
      }

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Set timeout to snap after scrolling stops
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const imageIndex = Math.round(scrollLeft / containerWidth);
        
        // Snap to the nearest image
        container.style.scrollBehavior = 'smooth';
        container.scrollTo({
          left: imageIndex * containerWidth,
          behavior: 'smooth'
        });
        
        setCurrentImageIndex(imageIndex);
        isScrolling = false;
      }, 150); // Wait 150ms after scrolling stops
    };

    const handleScrollEnd = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const imageIndex = Math.round(scrollLeft / containerWidth);
      setCurrentImageIndex(imageIndex);
    };

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('scrollend', handleScrollEnd);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [productImages.length]);

  return (
    <>
      <div className="relative h-auto lg:h-screen">
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #512123;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background:#512123;
          }
          /* Hide scrollbar on mobile for cleaner look */
          @media (max-width: 1023px) {
            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .custom-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          }
          
          /* Scroll snap for smooth image transitions */
          .scroll-snap-container {
            scroll-snap-type: x mandatory;
          }
          
          .scroll-snap-item {
            scroll-snap-align: center;
            scroll-snap-stop: always;
          }
          
          /* Disable scroll snap on desktop */
          @media (min-width: 1024px) {
            .scroll-snap-container {
              scroll-snap-type: none;
            }
            .scroll-snap-item {
              scroll-snap-align: none;
              scroll-snap-stop: normal;
            }
          }
`}</style>
        
        {/* Two-column layout on 2XL screens: Text on left, Images on right */}
        <div className="flex h-full">

          {/* Brand Name Section - Left side (2XL only) */}
          <div className="hidden 2xl:block w-1/2 h-full bg-gray-50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-6xl font-light text-gray-900 tracking-wider font-awaken">
                REVER
              </h1>
            </div>
          </div>

          
          {/* Scrollable Image Gallery - Right side */}
          <div 
            ref={scrollContainerRef}
            className="w-full 2xl:w-1/2 h-full overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden custom-scrollbar scroll-snap-container lg:scroll-snap-none"
          >
            {/* Mobile: Horizontal scrolling */}
            <div className="flex lg:block lg:space-y-0 space-x-0 lg:space-x-0 h-full lg:h-auto">
              {productImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative flex-shrink-0 w-screen lg:w-full min-h-[70vh] lg:min-h-screen cursor-pointer hover:opacity-90 transition-opacity lg:flex lg:items-center lg:justify-center bg-gray-50 scroll-snap-item lg:scroll-snap-none"
                  onClick={() => openModal(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    width={1200}
                    height={1800}
                    className="object-cover lg:object-contain h-[70vh] lg:h-full w-full"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Scroll Indicators */}
        {productImages.length > 1 && (
          <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                    container.scrollTo({
                      left: index * container.clientWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-gray-400' 
                            : 'bg-black'
                        }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={productImages}
        initialIndex={modalImageIndex}
      />
    </>
  );
} 