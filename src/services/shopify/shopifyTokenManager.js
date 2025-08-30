/**
 * Token Manager for Shopify Customer Access Tokens
 * Handles storage, retrieval, and validation of customer access tokens
 */

const TOKEN_STORAGE_KEY = 'shopify_customer_token';
const TOKEN_EXPIRY_KEY = 'shopify_customer_token_expiry';

export const shopifyTokenManager = {
  /**
   * Store customer access token and expiry
   * @param {string} accessToken - The access token to store
   * @param {string} expiresAt - ISO string of when the token expires
   */
  storeToken(accessToken, expiresAt) {
    try {
      // Store token in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
      
      // Also store in sessionStorage for current session
      sessionStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
      
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },

  /**
   * Retrieve the stored access token
   * @returns {string|null} - The access token or null if not found/expired
   */
  getToken() {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY) || sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!token || !expiry) {
        return null;
      }

      // Check if token is expired
      const now = new Date();
      const expiryDate = new Date(expiry);
      
      if (now >= expiryDate) {
        // Token expired, remove it
        this.removeToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  /**
   * Check if token exists and is valid
   * @returns {boolean} - True if token exists and is valid
   */
  hasValidToken() {
    const token = this.getToken();
    return token !== null;
  },

  /**
   * Get token expiry information
   * @returns {Object|null} - Token expiry info or null if no token
   */
  getTokenInfo() {
    try {
      const token = this.getToken();
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY) || sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!token || !expiry) {
        return null;
      }

      const now = new Date();
      const expiryDate = new Date(expiry);
      const isExpired = now >= expiryDate;
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

      return {
        token,
        expiresAt: expiry,
        isExpired,
        timeUntilExpiry,
        minutesUntilExpiry,
        isValid: !isExpired
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  },

  /**
   * Remove stored token and expiry
   */
  removeToken() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  /**
   * Refresh token if it's close to expiring (within 5 minutes)
   * @returns {boolean} - True if token should be refreshed
   */
  shouldRefreshToken() {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) {
      return false;
    }

    // Refresh if token expires within 5 minutes
    return tokenInfo.minutesUntilExpiry <= 5;
  },

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.removeToken();
    
    // Clear any other auth-related data
    try {
      localStorage.removeItem('shopify_customer_data');
      sessionStorage.removeItem('shopify_customer_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};
