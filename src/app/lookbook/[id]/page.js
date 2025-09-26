'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { shopifyService } from '../../../services/shopify/shopify';
import ProductCard from '../../../components/productsGrid/ProductCard';

export default function OutfitDetailPage() {
  const params = useParams();
  const lookbookHandle = params.id;
  const [lookbook, setLookbook] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLookbookData = async () => {
      try {
        setLoading(true);
        
        // Fetch the lookbook by handle
        const lookbookData = await shopifyService.getLookbookByHandle(lookbookHandle);
        
        if (!lookbookData) {
          setError('Lookbook not found');
          return;
        }
        
        setLookbook(lookbookData);
        
        // Fetch products for this lookbook
        if (lookbookData.productIds && lookbookData.productIds.length > 0) {
          const productPromises = lookbookData.productIds.map(productId => 
            shopifyService.getProductById(productId).catch(err => {
              console.warn(`Failed to fetch product ${productId}:`, err);
              return null;
            })
          );
          
          const productResults = await Promise.all(productPromises);
          const validProducts = productResults.filter(product => product !== null);
          setProducts(validProducts);
        }
        
      } catch (err) {
        console.error('Error fetching lookbook data:', err);
        setError('Failed to load lookbook');
      } finally {
        setLoading(false);
      }
    };

    fetchLookbookData();
  }, [lookbookHandle]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lookbook...</p>
        </div>
      </div>
    );
  }

  if (error || !lookbook) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">
            {error || 'Lookbook not found'}
          </h1>
          <Link href="/lookbook" className="text-blue-600 hover:text-blue-800">
            Back to Lookbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative pt-20">
      {/* Main Content */}
      <div className="flex h-full justify-center">
        <div className="max-w-7xl w-full flex mx-4 md:mx-16 my-4 md:my-16 gap-4 md:gap-20 flex-col lg:flex-row">
          {/* Left Side - Large Outfit Photo */}
          <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full">
            <div className="w-full h-full">
              <img
                src={lookbook.imageUrl}
                alt={lookbook.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Product Grid */}
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white">
            <div className="space-y-4 md:space-y-8">
              {/* Lookbook Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-light text-gray-900 mb-2">{lookbook.name}</h1>
                <p className="text-sm text-gray-600 capitalize">{lookbook.category}</p>
              </div>
              
              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode="grid-6"
                  />
                ))}
              </div>
              
              {/* Empty state */}
              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found for this lookbook.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 