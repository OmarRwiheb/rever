'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import WishlistButton from '@/components/wishlist/WishlistButton';
import ColorSizeSelectionModal from './ColorSizeSelectionModal';

export default function MobileStickyCart({ product, selectedColor, selectedSize, quantity, onColorChange, onSizeChange, originalButtonsRef }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isItemInCart } = useCart();

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

  // Handle button click - open modal instead of direct add to cart
  const handleButtonClick = () => {
    setIsModalOpen(true);
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
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 lg:hidden" style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)' }}>
          <div className="px-4 py-3">
            {/* Product Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
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
                onClick={handleButtonClick}
                className="flex-1 font-medium py-3 px-4 text-sm transition-colors bg-black text-white hover:bg-gray-800"
              >
                ADD TO CART
              </button>
              <WishlistButton product={product} size="default" showText={false} />
            </div>
          </div>
        </div>
      )}

      {/* Color Size Selection Modal */}
      <ColorSizeSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
        onColorChange={onColorChange}
        onSizeChange={onSizeChange}
      />
    </>
  );
}
