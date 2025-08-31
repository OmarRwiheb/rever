'use client';

import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

export default function CheckoutButton() {
  const { cart, getCheckoutUrl, updateCartBuyerIdentity, loading } = useCart();
  const { user, isAuthenticated } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // If user is logged in, ensure cart is associated with their account
    if (isAuthenticated && user) {
      setIsUpdating(true);
      try {
        // This will automatically associate the cart with the customer
        // The cart is already associated on login, but this ensures it's up to date
        await updateCartBuyerIdentity();
        console.log('Cart buyer identity updated successfully');
      } catch (error) {
        console.error('Failed to update cart buyer identity:', error);
        // Continue with checkout even if this fails
      } finally {
        setIsUpdating(false);
      }
    }

    // Get the checkout URL (automatically includes customer token if logged in)
    const checkoutUrl = await getCheckoutUrl();
    
    if (checkoutUrl) {
      // Redirect to Shopify checkout
      window.location.href = checkoutUrl;
    } else {
      alert('Unable to generate checkout URL');
    }
  };

  if (loading || isUpdating) {
    return (
      <button 
        disabled 
        className="w-full bg-gray-400 text-white py-3 px-6 rounded-md font-medium"
      >
        {isUpdating ? 'Updating...' : 'Loading...'}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={!cart || cart.items.length === 0}
        className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
          cart && cart.items.length > 0
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAuthenticated ? 'Proceed to Checkout' : 'Checkout as Guest'}
      </button>
      
      {isAuthenticated && (
        <p className="text-xs text-gray-600 text-center">
          Checkout with your account info: {user?.firstName} {user?.lastName}
        </p>
      )}
      
      {!isAuthenticated && (
        <p className="text-xs text-gray-600 text-center">
          Checkout as a guest (no account required)
        </p>
      )}
    </div>
  );
}
