'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { shopifyCustomerService, updateCustomer } from '@/services/shopify/shopifyCustomer';
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
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
    
    setIsUpdatingProfile(true);
    try {
      // Get the access token from storage using token manager
      const accessToken = shopifyTokenManager.getToken();
      
      if (!accessToken) {
        return { success: false, error: 'No access token found. Please log in again.' };
      }

      // Call Shopify Storefront API to update customer profile
      const result = await updateCustomer(accessToken, updates);
      
      if (result.success) {
        // Update local state with the updated customer data from Shopify
        const updatedUser = { ...user, ...result.customer };
        setUser(updatedUser);
        
        // Store updated user data in localStorage for persistence
        try {
          localStorage.setItem('shopify_customer_data', JSON.stringify(updatedUser));
          sessionStorage.setItem('shopify_customer_data', JSON.stringify(updatedUser));
        } catch (storageError) {
          console.warn('Could not save user data to storage:', storageError);
        }
        
        return { success: true, message: result.message || 'Profile updated successfully' };
      } else {
        // Return the error from Shopify API
        return {
          success: false,
          error: result.message || 'Failed to update profile',
          errors: result.errors
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred while updating profile' };
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    try {
      const result = await shopifyCustomerService.requestPasswordReset(email);
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'An unexpected error occurred while requesting password reset' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetUrl, password) => {
    setIsLoading(true);
    try {
      const result = await shopifyCustomerService.resetPassword(resetUrl, password);
      
      if (result.success) {
        // Store the token and set user as authenticated
        shopifyTokenManager.storeToken(
          result.accessToken.accessToken,
          result.accessToken.expiresAt
        );
        
        setUser(result.customer);
        setIsAuthenticated(true);
        
        // Associate cart with customer if cart exists
        try {
          if (cartService.hasCart()) {
            await cartService.updateCartBuyerIdentity(result.accessToken.accessToken);
            console.log('Cart successfully associated with customer after password reset');
          }
        } catch (cartError) {
          console.warn('Failed to associate cart with customer after password reset:', cartError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred while resetting password' };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isUpdatingProfile,
    login,
    signup,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
