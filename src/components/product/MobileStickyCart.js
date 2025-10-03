'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import WishlistButton from '@/components/wishlist/WishlistButton';

export default function MobileStickyCart({ product, selectedColor, selectedSize, quantity, onColorChange, originalButtonsRef }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const { addToCart, getItemQuantity, isItemInCart } = useCart();

  // Find the actual variant based on selected color and size
  const getSelectedVariant = () => {
    if (!product.variants || !product.variants.length) {
      return null;
    }
    
    // First, try to find an exact match
    let variant = product.variants.find(variant => {
      const colorMatch = selectedColor && variant.color && 
        variant.color.toLowerCase() === selectedColor.toLowerCase();
      const sizeMatch = selectedSize && variant.size && 
        variant.size.toLowerCase() === selectedSize.toLowerCase();
      
      return colorMatch && sizeMatch;
    });
    
    // If no exact match, try to find by color only
    if (!variant && selectedColor) {
      variant = product.variants.find(variant => 
        variant.color && variant.color.toLowerCase() === selectedColor.toLowerCase()
      );
    }
    
    // If still no match, try to find by size only
    if (!variant && selectedSize) {
      variant = product.variants.find(variant => 
        variant.size && variant.size.toLowerCase() === selectedSize.toLowerCase()
      );
    }
    
    // Final fallback to first variant
    if (!variant) {
      variant = product.variants[0];
    }
    
    return variant;
  };

  const selectedVariant = getSelectedVariant();
  const isInCart = selectedVariant ? isItemInCart(selectedVariant.id) : false;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant || isAddingToCart) return;

    setIsAddingToCart(true);
    setAddToCartMessage('');

    try {
      await addToCart(selectedVariant.id, quantity);
      setAddToCartMessage('Added to cart!');
      
      // Clear message after 2 seconds
      setTimeout(() => {
        setAddToCartMessage('');
      }, 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setAddToCartMessage('Failed to add to cart');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setAddToCartMessage('');
      }, 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Scroll detection to show/hide sticky component
  useEffect(() => {
    const handleScroll = () => {
      if (!originalButtonsRef) return;

      const originalButtonsRect = originalButtonsRef.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Show sticky component when original buttons are not visible
      // Hide when original buttons come into view (with some offset)
      const shouldShow = originalButtonsRect.bottom > windowHeight + 100;
      setIsVisible(shouldShow);
    };

    // Only add scroll listener if we have the ref
    if (originalButtonsRef) {
      // Initial check
      handleScroll();

      // Add scroll listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [originalButtonsRef]);

  // Don't render on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  // Don't render if we don't have the ref yet
  if (!originalButtonsRef) {
    return null;
  }

  return (
    <>
      {/* Sticky Mobile Cart */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden" style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)' }}>
          <div className="px-4 py-3">
            {/* Product Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                {selectedVariant && (
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedColor && <span>{selectedColor}</span>}
                    {selectedSize && <span className="ml-2">{selectedSize}</span>}
                  </div>
                )}
              </div>
              {selectedVariant && (
                <div className="text-sm font-semibold text-gray-900 ml-4">
                  EGP {typeof selectedVariant.price === 'object' ? selectedVariant.price.amount : selectedVariant.price}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0}
                className={`flex-1 font-medium py-3 px-4 text-sm transition-colors ${
                  isAddingToCart || !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isInCart
                    ? 'bg-gray-800 text-white hover:opacity-90'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isAddingToCart 
                  ? 'ADDING...' 
                  : !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0
                  ? 'OUT OF STOCK'
                  : isInCart 
                  ? 'ADDED TO CART' 
                  : 'ADD TO CART'
                }
              </button>
            </div>

            {/* Success/Error Message */}
            {addToCartMessage && (
              <div className={`mt-2 text-xs text-center ${
                addToCartMessage.includes('Failed') ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {addToCartMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
