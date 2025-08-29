'use client';
import { useState, useEffect } from 'react';
import MeasurementTablePopup from './MeasurementTablePopup';

export default function ProductInfo({ product, selectedColor, onColorChange }) {
  const [selectedSize, setSelectedSize] = useState('S');
  const [isMeasurementPopupOpen, setIsMeasurementPopupOpen] = useState(false);

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

        {/* Add to Basket Button */}
        <button className="w-full bg-white border border-gray-900 text-gray-900 font-medium py-3 px-6 hover:bg-gray-900 hover:text-white transition-colors">
          ADD TO BASKET
        </button>

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