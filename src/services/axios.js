import axios from 'axios';

// Create axios instance for local API calls
const api = axios.create({
  baseURL: '/api', // Points to your local Next.js API routes
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL helper that calls your local API route
export const apiClient = {
  graphql: async (query, variables = {}, config = {}) => {
    const res = await api.post('/shopify/graphql', { query, variables }, config);
    
    // Check for API errors
    if (res.data.error) {
      const error = new Error(`[Shopify GraphQL] ${res.data.error}`);
      error.name = 'ShopifyGraphQLError';
      error.details = res.data.details;
      throw error;
    }

    return res.data.data; // Return the GraphQL data
  },
};

export { api as default };
