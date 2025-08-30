'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function TestCartPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testVariantId, setTestVariantId] = useState('42494038310998');
  const [testQuantity, setTestQuantity] = useState(1);
  
  const { 
    cart, 
    addToCart, 
    updateCartLine, 
    removeFromCart, 
    clearCart, 
    refreshCart,
    getItemCount,
    getCartTotal 
  } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleTest = async (testName, testFunction) => {
    setLoading(true);
    setMessage(`Running ${testName}...`);
    
    try {
      await testFunction();
      setMessage(`${testName} completed successfully`);
    } catch (error) {
      setMessage(`${testName} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test functions
  const testCreateCart = async () => {
    await addToCart(testVariantId, 1);
    return 'Cart created successfully';
  };
  
  const testAddToCart = () => addToCart(testVariantId, testQuantity);

  const testUpdateCartLine = async () => {
    if (!cart?.items?.length) throw new Error('No items in cart to update');
    const firstItem = cart.items[0];
    return updateCartLine(firstItem.id, firstItem.quantity + 1);
  };

  const testRemoveFromCart = async () => {
    if (!cart?.items?.length) throw new Error('No items in cart to remove');
    const firstItem = cart.items[0];
    return removeFromCart(firstItem.id);
  };

  const testRaceCondition = async () => {
    console.log('Testing race condition prevention...');
    
    const promises = Array(5).fill().map((_, i) => 
      addToCart(testVariantId, 1).then(result => ({ index: i, cartId: result.id }))
    );
    
    const results = await Promise.all(promises);
    console.log('Race condition test results:', results);
    
    const uniqueIds = new Set(results.map(r => r.id));
    if (uniqueIds.size !== 1) {
      throw new Error('Race condition detected - multiple cart IDs created');
    }
    
    return `Race condition test passed - single cart ID: ${results[0].id}`;
  };

  const testButtons = [
    { name: 'Create Cart', action: testCreateCart, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Add to Cart', action: testAddToCart, color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Update Line', action: testUpdateCartLine, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { name: 'Remove Line', action: testRemoveFromCart, color: 'bg-red-600 hover:bg-red-700' },
    { name: 'Clear Cart', action: clearCart, color: 'bg-gray-600 hover:bg-gray-700' },
    { name: 'Race Condition', action: testRaceCondition, color: 'bg-pink-600 hover:bg-pink-700' },
  ];

  const getMessageStyle = (message) => {
    if (message.includes('successfully') || message.includes('passed')) {
      return 'bg-green-50 text-green-700 border border-green-200';
    }
    if (message.includes('failed') || message.includes('Error')) {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Service Test Page</h1>
        
        {/* Status Message */}
        {message && (
          <div className={`p-4 mb-6 rounded-md ${getMessageStyle(message)}`}>
            {message}
          </div>
        )}

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Variant ID
              </label>
              <input
                type="text"
                value={testVariantId}
                onChange={(e) => setTestVariantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter variant ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Quantity
              </label>
              <input
                type="number"
                value={testQuantity}
                onChange={(e) => setTestQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {testButtons.map((button) => (
              <button
                key={button.name}
                onClick={() => handleTest(button.name, button.action)}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${button.color}`}
              >
                {button.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Cart</h2>
              <p className="text-sm text-gray-600">
                Context Cart Count: {getItemCount()} | Total: {getCartTotal()}
              </p>
            </div>
            <button
              onClick={refreshCart}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : cart ? (
            <div>
              {/* Cart Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-600">Cart ID</p>
                  <p className="font-medium text-gray-900">{cart.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="font-medium text-gray-900">{cart.totalQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">{cart.subtotal || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium text-gray-900">{cart.total || 'N/A'}</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Items</h3>
                {cart.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">Variant ID: {item.variantId}</p>
                        <p className="text-sm text-gray-600">Price: {item.price}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Options:</p>
                            <ul className="text-sm text-gray-500">
                              {item.options.map((opt, optIndex) => (
                                <li key={optIndex}>{opt.name}: {opt.value}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.subtotal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cart found</h3>
              <p className="mt-1 text-sm text-gray-500">Create a cart to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
