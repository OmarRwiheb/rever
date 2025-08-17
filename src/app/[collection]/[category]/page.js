'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import FilterBar from '../../../components/productsGrid/FilterBar';
import ProductGrid from '../../../components/productsGrid/ProductGrid';
import allProducts from '../../../lib/mockProducts';
import Footer from '../../../components/Footer';

export default function CollectionPage() {
  const [viewMode, setViewMode] = useState('grid-6');
  const [filters, setFilters] = useState({ colors: [], sizes: [] });
  const [sortBy, setSortBy] = useState('featured');
//   const params = useParams(); // { gender: 'women', category: 'dresses' }

//   const slug = `${params.gender}/${params.category}`;

//   const filteredProducts = allProducts.filter(
//     (product) => product.collection === slug
//   );

//   const initialProducts = filteredProducts.slice(0, 27);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Color filter
      if (filters.colors.length > 0 && !filters.colors.includes(product.color)) {
        return false;
      }
      
      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes && product.sizes.some(size => 
          filters.sizes.includes(size)
        );
        if (!hasMatchingSize) {
          return false;
        }
      }
      
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''));
        case 'price-high':
          return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''));
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default: // featured
          return (a.isSale ? 1 : 0) - (b.isSale ? 1 : 0);
      }
    });

    return filtered;
  }, [filters, sortBy]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <FilterBar 
        totalItems={filteredProducts.length} 
        onViewModeChange={setViewMode}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        sortBy={sortBy}
        products={allProducts}
      />
      <ProductGrid products={filteredProducts} viewMode={viewMode} classes="mb-8" />
      <Footer />
    </div>
  );
}
