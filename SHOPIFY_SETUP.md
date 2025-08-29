# Shopify Integration Setup Guide

This guide will help you set up the Shopify integration for testing the services and API endpoints.

## Prerequisites

1. A Shopify store (can be a development store)
2. Access to Shopify admin panel
3. Node.js and npm/yarn installed

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Shopify Configuration
SHOPIFY_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/api/2024-07/graphql.json
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token_here
NODE_ENV=development
```

## Getting Your Shopify Credentials

### 1. Shopify GraphQL Endpoint

Your GraphQL endpoint follows this pattern:
```
https://{your-store-name}.myshopify.com/api/2024-07/graphql.json
```

Replace `{your-store-name}` with your actual store name.

### 2. Storefront Access Token

1. Go to your Shopify admin panel
2. Navigate to **Apps** > **App and sales channel sales channels** > **Develop apps**
3. Click **Create an app**
4. Give your app a name (e.g., "Website Integration")
5. Click **Create app**
6. Go to **Configuration** > **Storefront API**
7. Click **Configure**
8. Select the required scopes:
   - `read_products`
   - `read_product_listings`
   - `read_collections`
9. Click **Save**
10. Copy the **Storefront access token**

## Testing the Integration

Once you've set up your environment variables:

1. Start your development server: `npm run dev`
2. Navigate to `/test` to see all available test pages
3. Use the test pages to verify your Shopify integration

## Test Pages Available

### 1. `/test` - Navigation Page
- Overview of all available test pages
- Quick access to different testing areas

### 2. `/test-shopify` - Shopify Services Test
- Tests the `getProducts()` and `getProductById()` functions
- Displays fetched products with full details
- Tests error handling
- Checks environment variable configuration

### 3. `/test-api` - GraphQL API Test
- Test custom GraphQL queries
- Use preset query examples
- Test with variables
- View raw API responses

## Troubleshooting

### Common Issues

1. **"Shopify configuration missing" error**
   - Check that your `.env.local` file exists and has the correct variable names
   - Restart your development server after adding environment variables

2. **"Unauthorized" or "Forbidden" errors**
   - Verify your Storefront access token is correct
   - Check that your app has the required scopes enabled

3. **"Endpoint not found" errors**
   - Verify your GraphQL endpoint URL is correct
   - Make sure you're using the correct API version (2024-07)

4. **No products returned**
   - Ensure your store has published products
   - Check that products are available for sale
   - Verify your app has the correct scopes

### Debug Mode

To see more detailed error information, check your browser's developer console and your terminal where the Next.js server is running.

## API Reference

### Shopify Service Functions

```javascript
import { shopifyService } from '@/services/shopify/shopify';

// Get products with pagination
const result = await shopifyService.getProducts(10, cursor);

// Get single product by ID
const product = await shopifyService.getProductById('gid://shopify/Product/123');
```

### Direct API Access

```javascript
// Test the GraphQL endpoint directly
const response = await fetch('/api/shopify/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'query { products(first: 5) { edges { node { id title } } } }'
  })
});
```

## Support

If you encounter issues:

1. Check the error messages in the test pages
2. Verify your environment variables are set correctly
3. Check your Shopify app configuration
4. Ensure your store has products available for testing
