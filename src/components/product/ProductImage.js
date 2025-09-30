import Image from 'next/image';
import { useState } from 'react';
import ImageModal from './ImageModal';

export default function ProductImage({ product }) {
  // Use product images array or fallback to single image
  const productImages = product.images || [product.imageUrl];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const openModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative h-auto lg:h-screen">
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
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
          <div className="w-full 2xl:w-1/2 h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-0">
              {productImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative min-h-screen lg:min-h-screen cursor-pointer hover:opacity-90 transition-opacity lg:flex lg:items-center lg:justify-center bg-gray-50"
                  onClick={() => openModal(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    width={1200}
                    height={1800}
                    className="object-cover lg:object-contain h-screen! md:h-full!"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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