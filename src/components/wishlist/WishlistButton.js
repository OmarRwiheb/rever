'use client';
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

export default function WishlistButton({ product, size = 'default', showText = false }) {
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
      const result = toggleWishlist(product);
      
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
    default: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          transition-all duration-300
          ${isWishlisted 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
          }
          ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
          shadow-sm hover:shadow-md
        `}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isToggling ? (
          <div className={`${iconSizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
        ) : (
          <svg 
            className={iconSizeClasses[size]} 
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
      {message && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Text version for larger buttons */}
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {isWishlisted ? 'Saved' : 'Save'}
        </span>
      )}
    </div>
  );
}
