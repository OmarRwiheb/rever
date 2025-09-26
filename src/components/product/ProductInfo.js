'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import MeasurementTablePopup from './MeasurementTablePopup';
import WishlistButton from '@/components/wishlist/WishlistButton';
import StockStatus from './StockStatus';

export default function ProductInfo({ product, selectedColor, onColorChange }) {
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [isMeasurementPopupOpen, setIsMeasurementPopupOpen] = useState(false);
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

  // Check if current variant is in cart
  const isInCart = selectedVariant ? isItemInCart(selectedVariant.id) : false;
  const cartQuantity = selectedVariant ? getItemQuantity(selectedVariant.id) : 0;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setAddToCartMessage('Please select a variant');
      return;
    }

    setIsAddingToCart(true);
    setAddToCartMessage('');

    try {
      // Use the actual variant ID from Shopify
      const result = await addToCart(selectedVariant.id, quantity);
      
      if (result.success) {
        setAddToCartMessage('Added to cart successfully!');
        // Reset message after 3 seconds
        setTimeout(() => setAddToCartMessage(''), 3000);
      } else {
        setAddToCartMessage(result.error || 'Failed to add item to cart');
      }
    } catch (error) {
      setAddToCartMessage('Error adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Update quantity
  const updateQuantity = (delta) => {
    if (!selectedVariant) return;
    
    const maxQuantity = selectedVariant.quantityAvailable || 0;
    const newQuantity = Math.max(1, Math.min(maxQuantity, quantity + delta));
    setQuantity(newQuantity);
  };

  return (
    <>
      <div className="text-left space-y-6 lg:px-40 lg:pt-16">
        {/* Product Title */}
        <div className='mb-0'>
          <h1 className="text-xl font-medium text-gray-900 uppercase tracking-tight">
            {product.name}
          </h1>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          {product.isSale && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500 line-through">
                {product.originalPrice}
              </div>
              <div>
                <span className="text-sm font-medium text-black bg-[#FFE693] px-3 py-2 rounded">
                  -{product.discountPercentage}% {product.price}
                </span>
              </div>
            </div>
          )}
          {!product.isSale && (
            <div className="text-2xl font-medium text-gray-900">
              {product.price}
            </div>
          )}
        </div>

        {/* Stock Status */}
        {selectedVariant && (
          <div className="flex items-center space-x-2">
            <StockStatus variant={selectedVariant} showQuantity={true} size="md" />
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Description */}
        {product.description && (
          <div>
            <p className="text-gray-700 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>
        )}
          
        {/* Reference */}
        {product.reference && (
          <div className="text-xs text-gray-600">
            {product.reference}
          </div>
        )}

        {/* Color Display/Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Color</span>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {product.colors.length > 1 ? (
              // Multiple colors - show selection
              <div className="flex items-center space-x-4">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onColorChange(color)}
                    className={`text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'underline text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            ) : (
              // Single color - just show the color name
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {product.colors[0]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Size Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Size</span>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {product.sizes && product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'underline text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {size}
              </button>
            ))}
            {/* Info icon next to L */}
            <button className="text-xs text-gray-500 hover:text-gray-700">
              <div className="w-4 h-4 border border-gray-300 flex items-center justify-center">
                <span className="text-xs">i</span>
              </div>
            </button>
          </div>
          
          {/* Model Info */}
          {product.modelInfo && (
            <p className="text-xs text-gray-500">
              {product.modelInfo}
            </p>
          )}
        </div>

        {/* Quantity Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Quantity</span>
            {isInCart && (
              <span className="text-xs text-gray-500">
                {cartQuantity} in cart
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateQuantity(-1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-12 text-center text-sm text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(1)}
              disabled={!selectedVariant || quantity >= (selectedVariant.quantityAvailable || 0)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Message */}
        {addToCartMessage && (
          <div className={`p-3 rounded-md text-sm ${
            addToCartMessage.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {addToCartMessage}
          </div>
        )}

        {/* Add to Basket Button and Wishlist Button */}
        <div className="flex space-x-3">
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0}
            className={`flex-1 font-medium py-3 px-6 transition-colors ${
              isAddingToCart || !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
            }`}
          >
            {isAddingToCart 
              ? 'ADDING...' 
              : !selectedVariant || !selectedVariant.availableForSale || selectedVariant.quantityAvailable === 0
              ? 'OUT OF STOCK'
              : isInCart 
              ? 'ADDED TO CART' 
              : 'ADD TO BASKET'
            }
          </button>
          
          {/* Wishlist Button */}
          <WishlistButton product={product} size="default" showText={false} />
        </div>

        {/* Additional Links */}
        <div className="space-y-4 text-xs">
          <div className="flex justify-between">
            <button 
              onClick={() => setIsMeasurementPopupOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              SEE MEASUREMENT TABLE
            </button>
          </div>
        </div>
      </div>

      {/* Measurement Table Popup */}
      <MeasurementTablePopup 
        isOpen={isMeasurementPopupOpen}
        onClose={() => setIsMeasurementPopupOpen(false)}
      />
    </>
  );
} 