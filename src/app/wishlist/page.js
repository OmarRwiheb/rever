'use client';
import { useWishlist } from '@/contexts/WishlistContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  const { wishlistItems, clearWishlist, removeFromWishlist } = useWishlist();
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  const handleClearWishlist = async () => {
    setIsClearing(true);
    setClearMessage('');

    try {
      const result = clearWishlist();
      if (result.success) {
        setClearMessage('Wishlist cleared successfully');
        setTimeout(() => setClearMessage(''), 3000);
      }
    } catch (error) {
      setClearMessage('Error clearing wishlist');
      setTimeout(() => setClearMessage(''), 3000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <>
      <div className="bg-white pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-medium text-black mb-4">Your Wishlist is Empty</h1>
            <p className="text-black mb-8 max-w-md mx-auto">
              Start building your wishlist by adding items you love. You can save products for later and easily find them here.
            </p>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
    <div className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medium text-black mb-2">My Wishlist</h1>
            <p className="text-black">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleClearWishlist}
                disabled={isClearing}
                className="text-sm text-black hover:text-black underline disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          )}
        </div>

        {/* Clear message */}
        {clearMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            clearMessage.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {clearMessage}
          </div>
        )}

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative">
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <Link href={item.href} className="block w-full h-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </Link>

                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-black hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-2 px-1">
                <Link href={item.href} className="block">
                  <h3 className="text-xs font-medium text-black group-hover:text-black transition-colors uppercase mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
