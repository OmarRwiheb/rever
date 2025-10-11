// services/shopifyCollections.js
import { apiClient } from '../axios';

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $first: Int!, $after: String, $filters: [ProductFilter!]) 
  @inContext(country: EG, language: EN) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image { url altText }
      products(first: $first, after: $after, filters: $filters) {
        edges {
          cursor
          node {
            id
            title
            handle
            featuredImage { url altText }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            vendor
            tags
            options { name values }
            variants(first: 50) {
              edges {
                cursor
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                  image { url altText }
                }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

// Helper function to check if product has dev-only tag
const hasDevOnlyTag = (tags) => {
  if (!Array.isArray(tags)) return false;
  return tags.some(tag => tag.toLowerCase() === 'dev-only');
};

// Helper function to filter out dev-only products
const filterDevOnlyProducts = (products) => {
  return products.filter(product => !hasDevOnlyTag(product.tags));
};

export async function getCollectionProductsByHandle({
  handle,
  first = 24,
  after = null,
  filters = [],
}) {
  const data = await apiClient.graphql(COLLECTION_BY_HANDLE_QUERY, {
    handle, first, after, filters,
  });

  console.log('data', data);

  if (!data?.collection) {
    return { collection: null, products: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }

  const edges = data.collection.products?.edges ?? [];
  const products = edges.map(e => e.node);
  // Filter out dev-only products
  const filteredProducts = filterDevOnlyProducts(products);
  const pageInfo = data.collection.products?.pageInfo ?? { hasNextPage: false, endCursor: null };
  console.log('collection', data.collection);
  console.log('products', filteredProducts);
  return { collection: data.collection, products: filteredProducts, pageInfo };
}
