'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartService } from '@/services/shopify/shopifyCart';

// Cart state reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  cart: null,
  loading: false,
  error: null,
};

// Create context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Helper function to handle cart operations
  const handleCartOperation = useCallback(async (operation, errorMessage) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await operation();
      
      if (result) {
        dispatch({ type: 'SET_CART', payload: result });
        return { success: true, cart: result };
      } else {
        dispatch({ type: 'CLEAR_CART' });
        return { success: true, cart: null };
      }
    } catch (error) {
      console.error(`Error in cart operation:`, error);
      const message = error.message || errorMessage;
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // Load cart from Shopify
  const loadCart = useCallback(async () => {
    if (!cartService.hasCart()) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    await handleCartOperation(
      () => cartService.getCart(),
      'Failed to load cart'
    );
  }, [handleCartOperation]);

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    await handleCartOperation(
      () => cartService.getCart(),
      'Failed to refresh cart'
    );
  }, [handleCartOperation]);

  // Add item to cart
  const addToCart = useCallback(async (variantId, quantity = 1, customAttributes = []) => {
    return handleCartOperation(
      () => cartService.addToCart(variantId, quantity, customAttributes),
      'Failed to add item to cart'
    );
  }, [handleCartOperation]);

  // Update cart line quantity
  const updateCartLine = useCallback(async (lineId, quantity) => {
    if (quantity <= 0) {
      return handleCartOperation(
        () => cartService.removeFromCart(lineId),
        'Failed to remove item from cart'
      );
    }
    
    return handleCartOperation(
      () => cartService.updateCartLine(lineId, quantity),
      'Failed to update cart'
    );
  }, [handleCartOperation]);

  // Remove item from cart
  const removeFromCart = useCallback(async (lineId) => {
    return handleCartOperation(
      () => cartService.removeFromCart(lineId),
      'Failed to remove item from cart'
    );
  }, [handleCartOperation]);

  // Change variant for a cart line
  const changeVariant = useCallback(async (lineId, newVariantId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await cartService.changeVariant(lineId, newVariantId, quantity);
      
      if (result) {
        dispatch({ type: 'SET_CART', payload: result });
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }
      
      return { success: true, cart: result };
    } catch (error) {
      console.error('Failed to change variant:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get available variants for a product
  const getProductVariants = useCallback(async (productId) => {
    try {
      return await cartService.getProductVariants(productId);
    } catch (error) {
      console.error('Failed to get product variants:', error);
      return [];
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      return { success: true, cart: null };
    } catch (error) {
      console.error('Error clearing cart:', error);
      const message = error.message || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Computed values
  const getItemCount = useCallback(() => state.cart?.totalQuantity || 0, [state.cart]);
  const isCartEmpty = useCallback(() => !state.cart || state.cart.items.length === 0, [state.cart]);
  const getCartTotal = useCallback(() => state.cart?.total || '$0.00', [state.cart]);
  const isItemInCart = useCallback((variantId) => {
    if (!state.cart) return false;
    return state.cart.items.some(item => item.variantId === variantId);
  }, [state.cart]);
  const getItemQuantity = useCallback((variantId) => {
    if (!state.cart) return 0;
    const item = state.cart.items.find(item => item.variantId === variantId);
    return item ? item.quantity : 0;
  }, [state.cart]);

  const value = {
    // State
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addToCart,
    updateCartLine,
    removeFromCart,
    changeVariant,
    getProductVariants,
    clearCart,
    clearError,
    loadCart,
    refreshCart,
    
    // Computed values
    getItemCount,
    isCartEmpty,
    getCartTotal,
    isItemInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
