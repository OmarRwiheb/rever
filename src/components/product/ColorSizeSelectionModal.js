'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function ColorSizeSelectionModal({ 
  isOpen, 
  onClose, 
  product, 
  selectedColor, 
  selectedSize, 
  quantity,
  onColorChange,
  onSizeChange 
}) {
  const [localSelectedColor, setLocalSelectedColor] = useState(selectedColor || '');
  const [localSelectedSize, setLocalSelectedSize] = useState(selectedSize || '');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const { addToCart, isItemInCart } = useCart();

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedColor(selectedColor || '');
  }, [selectedColor]);

  useEffect(() => {
    setLocalSelectedSize(selectedSize || '');
  }, [selectedSize]);

  // Find the actual variant based on selected color and size
  const getSelectedVariant = () => {
    if (!product.variants || !product.variants.length) {
      return null;
    }
    
    // First, try to find an exact match
    let variant = product.variants.find(variant => {
      const colorMatch = localSelectedColor && variant.color && 
        variant.color.toLowerCase() === localSelectedColor.toLowerCase();
      const sizeMatch = localSelectedSize && variant.size && 
        variant.size.toLowerCase() === localSelectedSize.toLowerCase();
      
      return colorMatch && sizeMatch;
    });
    
    // If no exact match, try to find by color only
    if (!variant && localSelectedColor) {
      variant = product.variants.find(variant => 
        variant.color && variant.color.toLowerCase() === localSelectedColor.toLowerCase()
      );
    }
    
    // If still no match, try to find by size only
    if (!variant && localSelectedSize) {
      variant = product.variants.find(variant => 
        variant.size && variant.size.toLowerCase() === localSelectedSize.toLowerCase()
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

  const handleColorSelect = (color) => {
    setLocalSelectedColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleSizeSelect = (size) => {
    setLocalSelectedSize(size);
    if (onSizeChange) {
      onSizeChange(size);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAddingToCart) return;

    setIsAddingToCart(true);
    setAddToCartMessage('');

    try {
      await addToCart(selectedVariant.id, quantity);
      setAddToCartMessage('Added to cart!');
      
      // Close modal after successful add
      setTimeout(() => {
        onClose();
        setAddToCartMessage('');
      }, 1500);
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

  const handleClose = () => {
    setAddToCartMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-h-[80vh] transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Select to add</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="#512123" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="space-y-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-full text-left py-3 px-4 transition-colors ${
                      localSelectedColor === color
                        ? 'text-gray-900 underline'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="font-medium">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <div className="space-y-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`w-full text-left py-3 px-4 transition-colors ${
                      localSelectedSize === size
                        ? 'text-gray-900 underline'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="font-medium">{size}</span>
                  </button>
                ))}
              </div>
              
              {/* Model Info */}
              {product.modelInfo && (
                <p className="text-xs text-gray-500 mt-2">
                  {product.modelInfo}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Add to Cart Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* Selected variant info */}
          {selectedVariant && (
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                {localSelectedColor && <span>{localSelectedColor}</span>}
                {localSelectedSize && <span className="ml-2">{localSelectedSize}</span>}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                EGP {typeof selectedVariant.price === 'object' ? selectedVariant.price.amount : selectedVariant.price}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0}
            className={`w-full font-medium py-3 px-4 text-sm transition-colors ${
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
              : 'CONFIRM SELECTION'
            }
          </button>

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
    </div>
  );
}
