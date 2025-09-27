'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '../productsGrid/ProductGrid';
import { shopifyService } from '@/services/shopify/shopify';

export default function RelatedProducts({ product }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Extract related product IDs from metafields
        let relatedProductIds = [];
        
        // Check product level for metafields
        if (product?.metafields) {
          // Filter out null values from metafields array
          const validMetafields = product.metafields.filter(m => m !== null);
          
          const relatedMetafield = validMetafields.find(
            m => m.key === 'related_products'
          );
          
          if (relatedMetafield?.value) {
            try {
              relatedProductIds = JSON.parse(relatedMetafield.value);
            } catch (e) {
              console.error('Error parsing related products:', e);
            }
          }
        }
        
        if (relatedProductIds.length > 0) {
          // Fetch related products by IDs
          const products = await Promise.all(
            relatedProductIds.map(async (id) => {
              try {
                return await shopifyService.getProductById(id);
              } catch (error) {
                console.error('Error fetching related product:', id, error);
                return null;
              }
            })
          );
          
          // Filter out failed requests
          const validProducts = products.filter(p => p !== null);
          setRecommendations(validProducts);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error('Error in fetchRelatedProducts:', error);
        setRecommendations([]);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-20">
      <h2 className="text-xs text-gray-900 max-w-7xl">
        YOU MAY BE INTERESTED IN
      </h2>
      
      <ProductGrid products={recommendations} viewMode="grid-6" />
    </div>
  );
}
