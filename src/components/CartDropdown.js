'use client';

import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { shopifyTokenManager } from '@/services/shopify/shopifyTokenManager';
import Image from 'next/image';
import CustomerNotes from './CustomerNotes';

export default function CartDropdown({ isOpen, onClose }) {
  const { cart, loading, error, updateCartLine, removeFromCart, changeVariant, getProductVariants, clearCart, refreshCart, getCustomerCheckoutUrl, updateCartBuyerIdentity, getCheckoutUrl, updateCartNote } = useCart();
  const { user, isAuthenticated } = useUser();
  const dropdownRef = useRef(null);
  const [currentNote, setCurrentNote] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [availableVariants, setAvailableVariants] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Load available variants when editing an item
  useEffect(() => {
    if (editingItem && !availableVariants[editingItem.product.id]) {
      loadVariants(editingItem.product.id);
    }
  }, [editingItem, availableVariants]);

  const loadVariants = async (productId) => {
    try {
      const variants = await getProductVariants(productId);
      
      // Filter variants to only show in-stock ones
      const inStockVariants = variants.filter(variant => 
        variant.availableForSale && 
        (variant.quantityAvailable === null || 
         variant.quantityAvailable === undefined || 
         variant.quantityAvailable > 0)
      );
      
      setAvailableVariants(prev => ({ ...prev, [productId]: inStockVariants }));
    } catch (error) {
      console.error('Failed to load variants:', error);
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setSelectedVariants(prev => ({
      ...prev,
      [item.id]: {
        color: item.options.find(opt => opt.name.toLowerCase().includes('color'))?.value || '',
        size: item.options.find(opt => opt.name.toLowerCase().includes('size'))?.value || ''
      }
    }));
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setSelectedVariants({});
  };

  const handleVariantChange = async (itemId) => {
    if (!editingItem || !availableVariants[editingItem.product.id]) return;

    const selectedColor = selectedVariants[itemId]?.color;
    const selectedSize = selectedVariants[itemId]?.size;

    // Find the variant that matches the selected options
    const newVariant = availableVariants[editingItem.product.id].find(variant => {
      const variantColor = variant.selectedOptions.find(opt => 
        opt.name.toLowerCase().includes('color')
      )?.value;
      const variantSize = variant.selectedOptions.find(opt => 
        opt.name.toLowerCase().includes('size')
      )?.value;

      return variantColor === selectedColor && variantSize === selectedSize;
    });

    if (newVariant && newVariant.id !== editingItem.variantId) {
      try {
        await changeVariant(itemId, newVariant.id, editingItem.quantity);
        cancelEditing();
      } catch (error) {
        console.error('Failed to change variant:', error);
      }
    } else {
      cancelEditing();
    }
  };

  if (!isOpen) return null;

  const renderCartItem = (item) => (
    <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={item.product.image || '/img/product-test.jpg'}
          alt={item.product.imageAlt || item.product.title}
          width={60}
          height={60}
          className="rounded-md object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-montserrat-bold text-gray-900 truncate">
          {item.product.title}
        </h4>
        {item.options.length > 0 && (
          <p className="text-xs font-montserrat-regular text-gray-600 mt-1">
            {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
          </p>
        )}
        <p className="text-sm font-montserrat-bold text-gray-900 mt-1">
          {item.price}
        </p>
        
        {/* Variant Editing */}
        {editingItem?.id === item.id ? (
          <div className="mt-2 space-y-2">
            {/* Check if any variants are available */}
            {availableVariants[item.product.id] && availableVariants[item.product.id].length === 0 ? (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                No variants available in stock
              </div>
            ) : (
              <>
                {/* Color Selection */}
                {availableVariants[item.product.id] && availableVariants[item.product.id].length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="text-xs font-montserrat-bold text-gray-900">Color:</label>
                <select
                  value={selectedVariants[item.id]?.color || ''}
                  onChange={(e) => setSelectedVariants(prev => ({
                    ...prev,
                    [item.id]: { ...prev[item.id], color: e.target.value }
                  }))}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Color</option>
                  {Array.from(new Set(availableVariants[item.product.id]
                    .map(v => v.selectedOptions.find(opt => opt.name.toLowerCase().includes('color'))?.value)
                    .filter(Boolean)
                  )).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Size Selection */}
            {availableVariants[item.product.id] && availableVariants[item.product.id].length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="text-xs font-montserrat-bold text-gray-900">Size:</label>
                <select
                  value={selectedVariants[item.id]?.size || ''}
                  onChange={(e) => setSelectedVariants(prev => ({
                    ...prev,
                    [item.id]: { ...prev[item.id], size: e.target.value }
                  }))}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Size</option>
                  {Array.from(new Set(availableVariants[item.product.id]
                    .map(v => v.selectedOptions.find(opt => opt.name.toLowerCase().includes('size'))?.value)
                    .filter(Boolean)
                  )).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleVariantChange(item.id)}
                className="text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-800"
                disabled={availableVariants[item.product.id] && availableVariants[item.product.id].length === 0}
              >
                Update
              </button>
              <button
                onClick={cancelEditing}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => startEditing(item)}
            className="text-xs text-gray-900 hover:text-gray-800 mt-1"
          >
            Edit Variant
          </button>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateCartLine(item.id, item.quantity - 1)}
          disabled={loading}
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          -
        </button>
        <span className="w-8 text-center text-sm text-gray-900">
          {item.quantity}
        </span>
        <button
          onClick={() => updateCartLine(item.id, item.quantity + 1)}
          disabled={loading}
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        disabled={loading}
        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

  const renderCartSummary = () => (
    <div className="border-t border-gray-200 pt-4">
      
      {/* Shipping Information */}
      <div className="mb-4 text-center">
        <p className="text-xs font-montserrat-regular text-gray-600">
          Estimated shipping: 3-5 business days
        </p>
      </div>
      
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <span className="text-base font-montserrat-bold text-gray-900">Total</span>
        <span className="text-base font-montserrat-bold text-gray-900">{cart.total}</span>
      </div>
    </div>
  );

  const renderActionButtons = () => {
    return (
      <div className="flex space-x-3 pt-4">
        <button
          onClick={clearCart}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Clear Cart
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-transparent text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-500 text-center"
        >
          {isAuthenticated ? 'Checkout with Account' : 'Checkout as Guest'}
        </button>
      </div>
    );
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      // Save the customer note before checkout
      if (currentNote !== cart.note) {
        console.log('Saving customer note before checkout...');
        await updateCartNote(currentNote);
      }

      // If user is logged in, ensure cart is associated with their account
      if (isAuthenticated && user) {
        // Get the customer access token
        const accessToken = shopifyTokenManager.getToken();
        if (accessToken) {
          // This will automatically associate the cart with the customer
          // The cart is already associated on login, but this ensures it's up to date
          await updateCartBuyerIdentity(accessToken);
          console.log('Cart buyer identity updated successfully');
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
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your checkout. Please try again.');
    }
  };

  const renderEmptyCart = () => (
    <div className="text-center py-8">
      <svg className="mx-auto h-12 w-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h3 className="mt-2 text-sm font-awaken text-gray-900">Your cart is empty</h3>
      <p className="mt-1 text-sm font-montserrat-regular text-gray-600">Start shopping to add items to your cart.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div ref={dropdownRef} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-awaken text-gray-900">Shopping Cart</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshCart}
                  disabled={loading}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  title="Refresh cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            {/* Cart Content */}
            {!loading && cart && cart.items.length > 0 ? (
              <div className="space-y-4">
                {cart.items.map(renderCartItem)}
                {renderCartSummary()}
                <CustomerNotes onNoteChange={setCurrentNote} />
                {renderActionButtons()}
              </div>
            ) : (
              renderEmptyCart()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
