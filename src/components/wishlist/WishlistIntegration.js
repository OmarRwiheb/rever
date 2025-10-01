'use client';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';

export default function WishlistIntegration({ styles }) {
  const { getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();

  return (
    <Link 
      href="/wishlist"
      className={`relative flex items-center ${styles.text} ${styles.hover} transition-all duration-500 ease-out`}
      title="View Wishlist"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      
      {wishlistCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
    </Link>
  );
}
