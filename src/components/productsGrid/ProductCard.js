'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function ProductCard({ product, viewMode = 'grid-6' }) {
  const { id, name, imageUrl, price, originalPrice, variants } = product;
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  
  const { addToCart, isItemInCart } = useCart();

  // ✅ Build the product link by handle, with fallbacks
  const href =
    product.href ||
    `/products/${product.slug || product.handle || String(id || '').split('/').pop()}`;

  const calculateDiscount = (originalPrice, currentPrice) => {
    // keep your original logic to avoid visual/format changes
    const original = parseFloat(String(originalPrice).replace('EGP ', '').replace(',', ''));
    const current = parseFloat(String(currentPrice).replace('EGP ', '').replace(',', ''));
    const discountPercentage = ((original - current) / original) * 100;
    return `${Math.round(discountPercentage)}%`;
  };

  // Get the first available variant for quick add
  const getFirstVariant = () => {
    if (!variants || variants.length === 0) return null;
    
    // Try to find an available variant first
    const availableVariant = variants.find(v => v.availableForSale);
    return availableVariant || variants[0];
  };

  const firstVariant = getFirstVariant();

  // Handle quick add to cart
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) {
      setAddToCartMessage('No variants available');
      setTimeout(() => setAddToCartMessage(''), 2000);
      return;
    }
    
    setIsAddingToCart(true);
    setAddToCartMessage('');

    try {
      const result = await addToCart(firstVariant.id, 1);
      
      if (result.success) {
        setAddToCartMessage('Added!');
        // Reset message after 2 seconds
        setTimeout(() => setAddToCartMessage(''), 2000);
      } else {
        setAddToCartMessage('Error');
        setTimeout(() => setAddToCartMessage(''), 2000);
      }
    } catch (error) {
      setAddToCartMessage('Error');
      setTimeout(() => setAddToCartMessage(''), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Check if product is in cart (check if any variant is in cart)
  const isInCart = variants && variants.length > 0 ? 
    variants.some(variant => isItemInCart(variant.id)) : false;

  return (
    <div className="block group relative">
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Link href={href} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Hover Overlay with Quick Add Button */}
        {viewMode !== 'grid-12' && (
          <div className="absolute inset-0 transition-all duration-300 flex items-end justify-start pointer-events-none">
            <button 
              onClick={handleQuickAdd}
              disabled={isAddingToCart || !firstVariant}
              className={`p-2 rounded-full shadow-lg transition-all duration-300 m-2 pointer-events-auto ${
                isAddingToCart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isInCart
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
              title={isInCart ? 'Already in cart' : 'Quick add to cart'}
            >
              {isAddingToCart ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : isInCart ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
            
            {/* Quick Add Message */}
            {addToCartMessage && (
              <div className="absolute top-2 right-2 bg-white text-xs px-2 py-1 rounded shadow-md pointer-events-auto">
                {addToCartMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      {viewMode !== 'grid-12' && (
        <Link href={href} className="block text-left px-2 mt-1">
          <h3 className="text-xs font-medium text-gray-900 group-hover:text-gray-600 transition-colors uppercase mb-0.5">
            {name}
          </h3>

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
        </Link>
      )}
    </div>
  );
}
