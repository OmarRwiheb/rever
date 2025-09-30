import ProductCard from './ProductCard';

export default function ProductGrid({ products, viewMode = 'grid-6', classes }) {
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-y-4 sm:gap-y-4 gap-x-0.25 sm:gap-x-0.25';
      case 'grid-6':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-y-4 sm:gap-y-4 gap-x-0.25 sm:gap-x-0.25';
      case 'grid-12':
        return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12';
      default:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6';
    }
  };

  return (
    <div>
      {products.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-awaken text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 font-montserrat-regular">We couldn't find any products matching your current filters.</p>
            <div className="space-y-3 text-sm font-montserrat-regular text-gray-600">
              <p>Try:</p>
              <ul className="space-y-1">
                <li>• Adjusting your color or size selections</li>
                <li>• Clearing all filters to see all products</li>
                <li>• Checking if the spelling is correct</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${classes} grid ${getGridClasses()} gap-y-0.25 sm:gap-y-0.25 gap-x-0.25 sm:gap-x-0.25 ${
          viewMode === 'grid-2' ? 'px-8 sm:px-16 lg:px-32 xl:px-48 gap-x-8 sm:gap-x-8 lg:gap-x-8' : ''
        }`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
} 