// services/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const apiClient = {
  graphql: async (query, variables = {}, config = {}) => {
    try {
      const res = await api.post('/shopify/graphql', { query, variables }, config);
      
      if (res.data?.error) {
        const error = new Error(`[Shopify GraphQL] ${res.data.error}`);
        error.name = 'ShopifyGraphQLError';
        error.details = res.data.details;
        throw error;
      }
      
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export { api as default };
