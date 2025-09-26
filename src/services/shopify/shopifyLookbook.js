// services/shopify/shopifyLookbook.js
import { apiClient } from '../axios';

const LOOKBOOK_METAOBJECTS_QUERY = `
  query Metaobjects($first: Int!) @inContext(country: EG, language: EN) {
    metaobjects(type: "lookbook", first: $first) {
      edges {
        node {
          type
          handle
          id
          fields {
            key
            value
            reference {
              ... on MediaImage {
                alt
                id
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ---------- Helpers ----------
const parseProductsField = (productsValue) => {
  try {
    if (typeof productsValue === 'string') {
      return JSON.parse(productsValue);
    }
  } catch (error) {
    console.warn('Failed to parse products field:', productsValue);
  }
  return [];
};

const getFieldValue = (fields, key) => {
  const field = fields.find(f => f.key === key);
  return field ? field.value : null;
};

const getFieldReference = (fields, key) => {
  const field = fields.find(f => f.key === key);
  return field ? field.reference : null;
};

// ---------- Transformer ----------
const transformLookbook = (metaobject) => {
  const fields = metaobject.fields || [];
  
  const category = getFieldValue(fields, 'category');
  const imageReference = getFieldReference(fields, 'image');
  const name = getFieldValue(fields, 'name');
  const productsValue = getFieldValue(fields, 'products');
  
  const productIds = parseProductsField(productsValue);
  
  // Extract image URL from reference
  let imageUrl = '/img/lookbook.jpg'; // Default fallback
  if (imageReference && imageReference.image?.url) {
    imageUrl = imageReference.image.url;
  }
  
  console.log(`Transforming lookbook ${metaobject.handle}:`, {
    category,
    imageReference,
    imageUrl,
    name,
    productIds
  });
  
  return {
    id: metaobject.id,
    handle: metaobject.handle,
    name: name || 'Untitled Lookbook',
    category: category || 'general',
    imageUrl: imageUrl,
    productIds: productIds,
  };
};

// ---------- Public service ----------
export async function getLookbooks(first = 250) {
  try {
    const data = await apiClient.graphql(LOOKBOOK_METAOBJECTS_QUERY, { first });
    
    if (!data?.metaobjects?.edges) {
      throw new Error('Invalid response from Shopify Metaobjects API');
    }

    const lookbooks = data.metaobjects.edges.map(edge => transformLookbook(edge.node));
    
    console.log('Successfully fetched lookbooks:', lookbooks);
    return lookbooks;
  } catch (error) {
    console.error('Error fetching lookbooks:', error);
    throw error;
  }
}

export async function getLookbookByHandle(handle) {
  try {
    // For now, we'll fetch all lookbooks and filter by handle
    // In the future, you could create a more specific query if Shopify supports it
    const lookbooks = await getLookbooks();
    return lookbooks.find(lookbook => lookbook.handle === handle) || null;
  } catch (error) {
    console.error('Error fetching lookbook by handle:', error);
    throw error;
  }
}
