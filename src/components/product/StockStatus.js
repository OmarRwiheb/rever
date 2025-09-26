'use client';

export default function StockStatus({ variant, showQuantity = false, size = 'sm' }) {
  if (!variant) return null;

  const { availableForSale, quantityAvailable } = variant;
  
  // Only show "Out of Stock" if:
  // 1. availableForSale is explicitly false, OR
  // 2. availableForSale is true but quantityAvailable is explicitly 0
  const isOutOfStock = !availableForSale || (availableForSale && quantityAvailable === 0);
  
  if (!isOutOfStock) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} bg-gray-50 border border-gray-200 rounded-md`}>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
      <span className="font-medium text-gray-600 uppercase tracking-wide">
        Out of Stock
      </span>
    </div>
  );
}
