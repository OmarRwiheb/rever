/**
 * Shopify Storefront API Configuration
 * 
 * This file contains configuration settings for the Shopify Storefront API.
 * Make sure to set these environment variables in your .env.local file.
 */

export const shopifyConfig = {
  // Store domain (e.g., 'your-store.myshopify.com')
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'your-store.myshopify.com',
  
  // Storefront API access token
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
  
  // Storefront API version
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01',
  
  // Admin API access token (server-side only)
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
  
  // Admin API version
  adminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION || '2024-01',
  
  // Storefront API endpoint
  get storefrontApiUrl() {
    return `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`;
  },
  
  // Admin API endpoint
  get adminApiUrl() {
    return `https://${this.storeDomain}/admin/api/${this.adminApiVersion}/graphql.json`;
  },
  
  // Customer account URL (for password reset, etc.)
  get customerAccountUrl() {
    return `https://${this.storeDomain}/account`;
  },
  
  // Store URL
  get storeUrl() {
    return `https://${this.storeDomain}`;
  }
};

/**
 * Environment Variables Required:
 * 
 * # Storefront API (public - available in browser)
 * NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 * NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
 * NEXT_PUBLIC_SHOPIFY_API_VERSION=2024-01
 * 
 * # Admin API (server-side only - NOT public)
 * SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token
 * SHOPIFY_ADMIN_API_VERSION=2024-01
 * SHOPIFY_ADMIN_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/admin/api/2024-01/graphql.json
 * 
 * Note: NEXT_PUBLIC_ prefix makes variables available in the browser
 * Admin API variables are server-side only for security
 */

/**
 * To get your Storefront Access Token:
 * 1. Go to your Shopify admin
 * 2. Navigate to Settings > Apps and sales channels
 * 3. Click "Develop apps"
 * 4. Create a new app or select existing one
 * 5. Go to "Configuration" > "Storefront API"
 * 6. Generate a new access token with appropriate permissions
 * 7. Copy the token and add it to your .env.local file
 * 
 * To get your Admin Access Token:
 * 1. Go to your Shopify admin
 * 2. Navigate to Settings > Apps and sales channels
 * 3. Click "Develop apps"
 * 4. Create a new app or select existing one
 * 5. Go to "Configuration" > "Admin API access scopes"
 * 6. Select required scopes:
 *    - read_customers
 *    - write_customers
 *    - read_products
 *    - write_products
 * 7. Install the app and copy the Admin API access token
 * 8. Add it to your .env.local file (server-side only)
 */
