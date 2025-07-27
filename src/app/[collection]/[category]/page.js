'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import FilterBar from '../../../components/productsGrid/FilterBar';
import ProductGrid from '../../../components/productsGrid/ProductGrid';
import allProducts from '../../../lib/mockProducts';
import Footer from '../../../components/Footer';

export default function CollectionPage() {
  const [viewMode, setViewMode] = useState('grid-6');
//   const params = useParams(); // { gender: 'women', category: 'dresses' }

//   const slug = `${params.gender}/${params.category}`;

//   const filteredProducts = allProducts.filter(
//     (product) => product.collection === slug
//   );

//   const initialProducts = filteredProducts.slice(0, 27);

  return (
    <div className="min-h-screen bg-white pt-20">
      <FilterBar totalItems={allProducts.length} onViewModeChange={setViewMode} />
      <ProductGrid products={allProducts} viewMode={viewMode} classes="mb-8" />
      <Footer />
    </div>
  );
}
