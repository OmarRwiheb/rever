// services/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const apiClient = {
  graphql: async (query, variables = {}, config = {}) => {
    const res = await api.post('/shopify/graphql', { query, variables }, config);
    if (res.data?.error) {
      const error = new Error(`[Shopify GraphQL] ${res.data.error}`);
      error.name = 'ShopifyGraphQLError';
      error.details = res.data.details;
      throw error;
    }
    // Optional: inspect res.data.extensions?.cost here
    return res.data.data;
  },
};

export { api as default };
