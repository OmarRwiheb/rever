import ProductGrid from '../productsGrid/ProductGrid';
import products from '../../lib/mockProducts';

export default function ProductRecommendationGrid({ productId }) {
  // Get recommendations (excluding current product)
  const recommendations = products.filter(p => p.id !== productId).slice(0, 8);

  return (
    <div className="space-y-6 mt-20">
      <h2 className="text-xs text-gray-900 max-w-7xl lg:pl-8">
        YOU MAY BE INTERESTED IN
      </h2>
      
      <ProductGrid products={recommendations} viewMode="grid-6" />
    </div>
  );
} 