'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { shopifyCustomerService } from '@/services/shopify/shopifyCustomer';
import { shopifyTokenManager } from '@/services/shopify/shopifyTokenManager';
import { cartService } from '@/services/shopify/shopifyCart';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = shopifyTokenManager.getToken();
        
        if (token && shopifyTokenManager.hasValidToken()) {
          // Token exists and is valid, fetch customer data
          const result = await shopifyCustomerService.getCustomer(token);
          
          if (result.success) {
            setUser(result.customer);
            setIsAuthenticated(true);
            
            // Associate cart with customer if cart exists
            try {
              if (cartService.hasCart()) {
                await cartService.updateCartBuyerIdentity(token);
                console.log('Cart successfully associated with customer on app load');
              }
            } catch (cartError) {
              console.warn('Failed to associate cart with customer on app load:', cartError);
              // Don't fail authentication if cart association fails
            }
          } else {
            // Token might be invalid, clear it
            shopifyTokenManager.clearAuth();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        shopifyTokenManager.clearAuth();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      // Use Shopify API to create access token
      const result = await shopifyCustomerService.createCustomerAccessToken(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Store the token
        shopifyTokenManager.storeToken(
          result.accessToken.accessToken,
          result.accessToken.expiresAt
        );
        
        // Fetch customer data
        const customerResult = await shopifyCustomerService.getCustomer(result.accessToken.accessToken);
        console.log('customerResult', customerResult);
        if (customerResult.success) {
          setUser(customerResult.customer);
          setIsAuthenticated(true);
          
          // Associate cart with customer if cart exists
          try {
            if (cartService.hasCart()) {
              await cartService.updateCartBuyerIdentity(result.accessToken.accessToken);
              console.log('Cart successfully associated with customer');
            }
          } catch (cartError) {
            console.warn('Failed to associate cart with customer:', cartError);
            // Don't fail login if cart association fails
          }
          
          return { success: true, message: 'Login successful' };
        } else {
          return { success: false, error: 'Failed to fetch customer data' };
        }
      } else {
        return { 
          success: false, 
          error: result.message || 'Login failed',
          errors: result.errors || []
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    setIsLoading(true);
    try {
      // Validate customer data first
      const validation = shopifyCustomerService.validateCustomerData(userData);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: 'Please fix the validation errors',
          errors: validation.errors
        };
      }

      // Use Shopify API to create customer
      const result = await shopifyCustomerService.createCustomer(userData);
      
      if (result.success) {
        // Customer created successfully, now log them in
        const loginResult = await login(userData.email, userData.password);
        
        if (loginResult.success) {
          return { success: true, message: 'Account created and logged in successfully' };
        } else {
          return { 
            success: false, 
            error: 'Account created but login failed. Please try logging in.',
            customerCreated: true
          };
        }
      } else {
        return { 
          success: false, 
          error: result.message || 'Account creation failed',
          errors: result.errors || []
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during signup' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear stored tokens and data
    shopifyTokenManager.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      // For now, we'll just update the local state
      // TODO: Implement customer update mutation when needed
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Store updated user data in localStorage for persistence
      try {
        localStorage.setItem('shopify_customer_data', JSON.stringify(updatedUser));
        sessionStorage.setItem('shopify_customer_data', JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn('Could not save user data to storage:', storageError);
      }
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred while updating profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
