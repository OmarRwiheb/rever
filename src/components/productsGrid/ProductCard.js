import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product, viewMode = 'grid-6' }) {
  const { id, name, imageUrl, price, originalPrice } = product;

  const calculateDiscount = (originalPrice, currentPrice) => {
    // Extract numeric values from price strings (remove "EGP " and parse)
    const original = parseFloat(originalPrice.replace('EGP ', '').replace(',', ''));
    const current = parseFloat(currentPrice.replace('EGP ', '').replace(',', ''));
    const discountPercentage = ((original - current) / original) * 100;
    return `${Math.round(discountPercentage)}%`;
  };

  return (
    <div className="group relative">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
                    {/* Hover Overlay with Quick Add Button */}
        {viewMode !== 'grid-12' && (
          <div className="absolute inset-0 transition-all duration-300 flex items-end justify-start">
            <button className=" bg-white text-gray-900 shadow-lg transition-all duration-300 hover:bg-gray-100 m-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        )}
        </div>

              {/* Product Info */}
      {viewMode !== 'grid-12' && (
        <div className="text-left px-2 mt-1">
            <Link href={`/product/${id}`} className="block leading-tight">
                <h3 className="text-xs font-medium text-gray-900 hover:text-gray-600 transition-colors uppercase mb-0.5">
                {name}
                </h3>
            </Link>

            {originalPrice && (
                <span className="text-xs text-gray-900 line-through mb-0.5 block">
                {originalPrice}
                </span>
            )}

            <div className="flex flex-col items-start justify-start text-xs leading-tight">
                <span className={`font-medium text-gray-900 ${originalPrice ? 'bg-[#FFE693]' : ''}`}>
                {originalPrice && (
                    <span className="font-medium text-gray-900 mr-1">
                        -{calculateDiscount(originalPrice, price)}
                    </span>
                )}
                {price}
                </span>
            </div>
        </div>
      )}
    </div>
  );
} 