'use client';
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

export default function WishlistButton({ product, size = 'default', showText = false, variant = 'square', borderless = false, tooltipPosition = 'top', showTooltip = true, context = 'product-page' }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const [message, setMessage] = useState('');

  const isWishlisted = isInWishlist(product.id);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsToggling(true);
    setMessage('');

    try {
      const result = await toggleWishlist(product);
      
      if (result.success) {
        setMessage(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(result.error || 'Error updating wishlist');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      setMessage('Error updating wishlist');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-10 h-10',
    cart: 'w-9 h-9' // matches the add to cart button size
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6',
    cart: 'w-5 h-5' // matches the add to cart button icon size
  };

  const variantClasses = {
    square: '',
    circular: 'rounded-full'
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          flex items-center justify-center
          font-medium
          transition-colors
          ${isWishlisted 
            ? context === 'product-card' 
              ? 'text-slate-50 hover:text-slate-50'
              : 'text-gray-900 hover:text-gray-900'
            : borderless 
              ? context === 'product-card' 
                ? 'text-slate-50 hover:text-slate-50'
                : 'text-black hover:text-gray-600'
              : 'bg-transparent text-gray-900'
          }
          ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isToggling ? (
          <div className={`${iconSizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
        ) : (
          <svg 
            className={`${iconSizeClasses[size]} drop-shadow-lg`} 
            fill={isWishlisted ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        )}
      </button>

      {/* Message tooltip */}
      {message && showTooltip && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none ${
          tooltipPosition === 'bottom' ? 'top-full mt-2' : '-top-12'
        }`}>
          {message}
          <div className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
            tooltipPosition === 'bottom' 
              ? 'bottom-full border-b-4 border-b-gray-900' 
              : 'top-full border-t-4 border-t-gray-900'
          }`}></div>
        </div>
      )}


    </div>
  );
}
