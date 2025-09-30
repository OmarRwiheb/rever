'use client';

import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import CustomerNotes from './CustomerNotes';

export default function CheckoutButton() {
  const { cart, getCheckoutUrl, updateCartBuyerIdentity, updateCartNote, loading } = useCart();
  const { user, isAuthenticated } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsUpdating(true);

    try {
      // Save the customer note before checkout
      if (currentNote !== cart.note) {
        console.log('Saving customer note before checkout...');
        await updateCartNote(currentNote);
      }

      // If user is logged in, ensure cart is associated with their account
      if (isAuthenticated && user) {
        // This will automatically associate the cart with the customer
        // The cart is already associated on login, but this ensures it's up to date
        await updateCartBuyerIdentity();
        console.log('Cart buyer identity updated successfully');
      }

      // Get the checkout URL (automatically includes customer token if logged in)
      const checkoutUrl = await getCheckoutUrl();
      
      if (checkoutUrl) {
        // Redirect to Shopify checkout
        window.location.href = checkoutUrl;
      } else {
        alert('Unable to generate checkout URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your checkout. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || isUpdating) {
    return (
      <button 
        disabled 
        className="w-full bg-gray-400 text-white py-3 px-6 rounded-md font-montserrat-bold"
      >
        {isUpdating ? 'Updating...' : 'Loading...'}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Customer Notes Section */}
      <CustomerNotes onNoteChange={setCurrentNote} />
      
      {/* Checkout Button */}
      <div className="space-y-2">
        <button
          onClick={handleCheckout}
          disabled={!cart || cart.items.length === 0}
          className={`w-full py-3 px-6 rounded-md font-montserrat-bold transition-colors ${
            cart && cart.items.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUpdating ? 'Processing...' : (isAuthenticated ? 'Proceed to Checkout' : 'Checkout as Guest')}
        </button>
        
        {isAuthenticated && (
          <p className="text-xs font-montserrat-regular text-gray-600 text-center">
            Checkout with your account info: {user?.firstName} {user?.lastName}
          </p>
        )}
        
        {!isAuthenticated && (
          <p className="text-xs font-montserrat-regular text-gray-600 text-center">
            Checkout as a guest (no account required)
          </p>
        )}
      </div>
    </div>
  );
}
