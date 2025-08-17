import Image from 'next/image';

export default function ProductImage({ product }) {
  // Use product images array or fallback to single image
  const productImages = product.images || [product.imageUrl];

  return (
    <div className="relative h-auto lg:h-screen">
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>
      
      {/* Two-column layout on 2XL screens */}
      <div className="flex h-full">

        {/* Additional Photo Section - Right side (2XL only) */}
        <div className="hidden 2xl:block w-1/2 h-full">
          <div className="relative h-full">
            <Image
              src={productImages[0]}
              alt={`${product.name} - Additional view`}
              fill
              className="object-cover"
              sizes="30vw"
            />
          </div>
        </div>

        
        {/* Scrollable Image Gallery - Left side */}
        <div className="w-full 2xl:w-1/2 h-full overflow-y-auto custom-scrollbar">
          <div className="space-y-0">
            {productImages.map((image, index) => (
              <div key={index} className="relative h-screen lg:h-screen">
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 60vw, 30vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Massimo Dutti Logo */}
      <div className="absolute bottom-8 left-8">
        <span className="text-black font-semibold text-lg">Massimo Dutti</span>
      </div>
    </div>
  );
} 