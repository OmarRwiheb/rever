'use client';

import { useParams } from 'next/navigation';
import ProductImage from '../../../components/product/ProductImage';
import ProductInfo from '../../../components/product/ProductInfo';
import ProductHighlights from '../../../components/product/ProductHighlights';
import ProductRecommendationGrid from '../../../components/product/ProductRecommendationGrid';
import Footer from '../../../components/Footer';
import products from '../../../lib/mockProducts';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  
  // Find the product by id
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row">
        {/* Product Image - Full width on mobile, left side on desktop */}
        <div className="w-full lg:w-1/2 2xl:w-2/3 lg:sticky lg:top-0 lg:h-screen">
          <ProductImage product={product} />
        </div>
        
        {/* Product Info - Full width on mobile, right side on desktop */}
        <div className="w-full lg:w-1/2 2xl:w-1/3">
          <div className="px-4 lg:px-8 py-8">
            <ProductInfo product={product} />
            <ProductHighlights />
          </div>
        </div>
      </div>

      {/* Product Recommendations - Under both sections */}
      <div className="w-full px-4 lg:px-8 py-8">
        <ProductRecommendationGrid productId={product.id} />
      </div>

      <Footer />
    </div>
  );
} 