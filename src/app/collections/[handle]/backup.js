'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import FilterBar from '../../../components/productsGrid/FilterBar';
import ProductGrid from '../../../components/productsGrid/ProductGrid';
import Footer from '../../../components/Footer';
import { shopifyService } from '@/services/shopify/shopify';

const DEFAULT_SIZE = 'ONE_SIZE';
const DEFAULT_COLOR = 'MULTI';
const DEFAULT_CURRENCY = 'USD';

function toPriceString(amount, currency) {
  const a = Number(amount ?? 0);
  const c = currency || DEFAULT_CURRENCY;
  return `${c} ${a.toFixed(2)}`;
}

// Map a Storefront product node → your grid item shape
function mapNodeToCard(node) {
  const minPrice = node?.priceRange?.minVariantPrice?.amount;
  const currency = node?.priceRange?.minVariantPrice?.currencyCode || DEFAULT_CURRENCY;

  // sizes from options if present
  const sizeOpt =
    (node?.options || []).find((o) =>
      String(o?.name || '').toLowerCase().includes('size')
    )?.values || [DEFAULT_SIZE];

  // naive color (you can improve if you store color option)
  const color = DEFAULT_COLOR;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    imageUrl: node?.featuredImage?.url || '/img/product-test.jpg',
    images: node?.featuredImage?.url ? [node.featuredImage.url] : [],
    price: toPriceString(minPrice, currency),
    originalPrice: null,       // you can extend the collection query to include variants/compareAt if needed
    isNew: false,              // optional: compute from createdAt if you add it to the query
    isSale: false,             // optional: compute from compareAt if you add variants
    description: node?.description || '',
    color,
    colors: [color],
    reference: `REF. ${node.id.split('/').pop()}`,
    sizes: sizeOpt,
    modelInfo: '',
    discountPercentage: 0,
  };
}

export default function CollectionPage() {
  const params = useParams(); // { handle: 'men-shoes' }
  const handle = String(params?.handle || '');
  console.log('Route params:', params); // Debug: see what params we actually get
  console.log('Handle:', handle); // Debug: see the handle

  const [viewMode, setViewMode] = useState('grid-6');
  const [filters, setFilters] = useState({ colors: [], sizes: [] });
  const [sortBy, setSortBy] = useState('featured');

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        console.log('Fetching collection with handle:', handle);
        const { products } = await shopifyService.getCollectionProductsByHandle({
          handle, // adjust up to 250 if you like
          maxPages: 100,
        });

        if (!mounted) return;

        const mapped = (products || []).map(mapNodeToCard);
        setAllProducts(mapped);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        console.error('Collection load failed:', e);
        setErr('Failed to load products.');
        setAllProducts([]);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [handle]);

  // Apply filters + sorting
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      // Filter out dev-only products
      if (product.tags && product.tags.some(tag => tag.toLowerCase() === 'dev-only')) {
        return false;
      }
      
      // Color filter
      if (filters.colors.length > 0 && !filters.colors.includes(product.color)) {
        return false;
      }
      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = product.sizes && product.sizes.some((s) => filters.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const toNum = (p) => parseFloat(String(p).replace(/[^\d.]/g, '')) || 0;
      switch (sortBy) {
        case 'price-low':  return toNum(a.price) - toNum(b.price);
        case 'price-high': return toNum(b.price) - toNum(a.price);
        case 'name':       return a.name.localeCompare(b.name);
        case 'newest':     return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:           return (a.isSale ? 1 : 0) - (b.isSale ? 1 : 0);
      }
    });

    return filtered;
  }, [allProducts, filters, sortBy]);

  const handleFiltersChange = (newFilters) => setFilters(newFilters);
  const handleSortChange = (newSortBy) => setSortBy(newSortBy);

  return (
    <div className="min-h-screen bg-white pt-20">
      <FilterBar
        totalItems={filteredProducts.length}
        onViewModeChange={setViewMode}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        sortBy={sortBy}
        products={allProducts}   // if FilterBar needs full list to build facets
      />
      {loading ? (
        <div className="px-6 py-20 text-center text-sm text-gray-500">Loading…</div>
      ) : err ? (
        <div className="px-6 py-20 text-center text-sm text-red-600">{err}</div>
      ) : (
        <ProductGrid products={filteredProducts} viewMode={viewMode} classes="mb-8" />
      )}
      <Footer />
    </div>
  );
}
