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
      <div className={`${classes} grid ${getGridClasses()} gap-y-0.25 sm:gap-y-0.25 gap-x-0.25 sm:gap-x-0.25 ${
        viewMode === 'grid-2' ? 'px-8 sm:px-16 lg:px-32 xl:px-48 gap-x-8 sm:gap-x-8 lg:gap-x-8' : ''
      }`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
} 