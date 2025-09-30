'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { shopifyService } from '../services/shopify/shopify';
import { shopifyTokenManager } from '../services/shopify/shopifyTokenManager';
import { useUser } from './UserContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Load wishlist from Shopify (for logged-in users) or localStorage (for guests)
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && user?.id) {
        // Clear wishlist immediately when user becomes authenticated
        setWishlistItems([]);
        // Clear localStorage when user becomes authenticated
        localStorage.removeItem('wishlist');
        try {
          // Load from Shopify for logged-in users (don't touch localStorage)
          
          // Get access token from shopifyTokenManager
          const token = shopifyTokenManager.getToken();
          if (!token) {
            // If no token, keep empty state instead of loading localStorage
            setWishlistItems([]);
            return;
          }
          
          const customerResult = await shopifyService.getCustomer(token);
          if (customerResult.success) {
            const productIds = shopifyService.getWishlistFromCustomer(customerResult.customer);
            
            // Convert product IDs to wishlist items
            const wishlistItems = await Promise.all(
              productIds.map(async (productId) => {
                try {
                  const product = await shopifyService.getProductById(productId);
                  return {
                    id: product.id,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    href: `/products/${product.slug}`,
                    addedAt: new Date().toISOString()
                  };
                } catch (error) {
                  return null;
                }
              })
            );
            
            const validItems = wishlistItems.filter(item => item !== null);
            setWishlistItems(validItems);
          } else {
            // If Shopify fails, keep empty state instead of loading localStorage
            setWishlistItems([]);
          }
        } catch (error) {
          // If any error occurs, keep empty state instead of loading localStorage
          setWishlistItems([]);
        }
      } else {
        // Load from localStorage for guests
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };
    
    const loadFromLocalStorage = () => {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlistItems(parsedWishlist);
        } catch (error) {
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
    };
    
    loadWishlist();
  }, [isAuthenticated, user?.id]);

  // Save wishlist to localStorage when user is NOT authenticated (keep them separate)
  // Always save to localStorage for guests, including when clearing (empty array)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      return { success: false, error: 'Product already in wishlist' };
    }

    const wishlistItem = {
      id: product.id,
      name: product.name || product.title,
      imageUrl: product.imageUrl || product.featuredImage?.url || '/img/placeholder.jpg',
      price: product.price?.amount || product.price || '0',
      originalPrice: product.originalPrice || product.compareAtPrice?.amount || null,
      href: product.href || `/products/${product.slug || product.handle || String(product.id).split('/').pop()}`,
      addedAt: new Date().toISOString()
    };

    // Add to local state immediately for better UX
    setWishlistItems(prev => [...prev, wishlistItem]);

    // If user is authenticated, also update Shopify
    if (isAuthenticated && user?.id) {
      try {
        const currentProductIds = wishlistItems.map(item => item.id);
        const updatedProductIds = [...currentProductIds, product.id];
        
        const result = await shopifyService.updateCustomerWishlist(user.id, updatedProductIds);
        if (!result.success) {
          // Revert local state if Shopify update failed
          setWishlistItems(prev => prev.filter(item => item.id !== product.id));
          return { success: false, error: result.message };
        }
      } catch (error) {
        // Revert local state if Shopify update failed
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        return { success: false, error: 'Failed to sync with server' };
      }
    }

    return { success: true };
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    // Remove from local state immediately for better UX
    setWishlistItems(prev => prev.filter(item => item.id !== productId));

    // If user is authenticated, also update Shopify
    if (isAuthenticated && user?.id) {
      try {
        const updatedProductIds = wishlistItems
          .filter(item => item.id !== productId)
          .map(item => item.id);
        
        const result = await shopifyService.updateCustomerWishlist(user.id, updatedProductIds);
        if (!result.success) {
          // Revert local state if Shopify update failed
          setWishlistItems(prev => [...prev, wishlistItems.find(item => item.id === productId)]);
          return { success: false, error: result.message };
        }
      } catch (error) {
        // Revert local state if Shopify update failed
        setWishlistItems(prev => [...prev, wishlistItems.find(item => item.id === productId)]);
        return { success: false, error: 'Failed to sync with server' };
      }
    }

    return { success: true };
  };

  // Toggle product in wishlist
  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    // Clear local state immediately for better UX
    setWishlistItems([]);

    // If user is authenticated, also update Shopify
    if (isAuthenticated && user?.id) {
      try {
        const result = await shopifyService.updateCustomerWishlist(user.id, []);
        if (!result.success) {
          // Revert local state if Shopify update failed
          setWishlistItems(wishlistItems);
          return { success: false, error: result.message };
        }
      } catch (error) {
        // Revert local state if Shopify update failed
        setWishlistItems(wishlistItems);
        return { success: false, error: 'Failed to sync with server' };
      }
    } else {
      // For guests, also clear localStorage when intentionally clearing
      localStorage.setItem('wishlist', JSON.stringify([]));
    }

    return { success: true };
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
