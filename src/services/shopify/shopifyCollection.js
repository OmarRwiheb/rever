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
  const pageInfo = data.collection.products?.pageInfo ?? { hasNextPage: false, endCursor: null };
  console.log('collection', data.collection);
  console.log('products', products);
  return { collection: data.collection, products, pageInfo };
}
