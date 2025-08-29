'use client';

import { useEffect, useMemo, useState } from 'react';
import FilterBar from '../../../components/productsGrid/FilterBar';
import ProductGrid from '../../../components/productsGrid/ProductGrid';
import Footer from '../../../components/Footer';
import { shopifyService } from '@/services/shopify/shopify'; // <- use the ALL-PAGES fn

const DEFAULT_SIZE = 'ONE_SIZE';
const DEFAULT_COLOR = 'MULTI';
const DEFAULT_CURRENCY = 'USD';

function toPriceString(amount, currency) {
  const a = Number(amount ?? 0);
  const c = currency || DEFAULT_CURRENCY;
  return `${c} ${a.toFixed(2)}`;
}

// Map Storefront product node -> your grid item shape
function mapNodeToCard(node) {
  const minPrice = node?.priceRange?.minVariantPrice?.amount;
  const currency = node?.priceRange?.minVariantPrice?.currencyCode || DEFAULT_CURRENCY;

  const sizeOpt =
    (node?.options || []).find((o) =>
      String(o?.name || '').toLowerCase().includes('size')
    )?.values || [DEFAULT_SIZE];

  const color = DEFAULT_COLOR;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    imageUrl: node?.featuredImage?.url || '/img/product-test.jpg',
    images: node?.featuredImage?.url ? [node.featuredImage.url] : [],
    price: toPriceString(minPrice, currency),
    originalPrice: null,
    isNew: false,
    isSale: false,
    description: node?.description || '',
    color,
    colors: [color],
    reference: `REF. ${node.id.split('/').pop()}`,
    sizes: sizeOpt,
    modelInfo: '',
    discountPercentage: 0,
  };
}

export default function CollectionClient({ handle }) {
  const [viewMode, setViewMode] = useState('grid-6');
  const [filters, setFilters] = useState({ colors: [], sizes: [] });
  const [sortBy, setSortBy] = useState('featured');

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setErr(null);
    setLoading(true);

    (async () => {
      try {
        const { products } = await shopifyService.getCollectionProductsByHandle({
          handle,
          pageSize: 100,  // up to 250 with Storefront API
          maxPages: 100,
        });
        if (!mounted) return;
        setAllProducts((products || []).map(mapNodeToCard));
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

  const filteredProducts = useMemo(() => {
    const out = allProducts
      .filter((p) => {
        if (filters.colors.length > 0 && !filters.colors.includes(p.color)) return false;
        if (filters.sizes.length > 0) {
          const hasSize = p.sizes?.some((s) => filters.sizes.includes(s));
          if (!hasSize) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const toNum = (p) => parseFloat(String(p).replace(/[^\d.]/g, '')) || 0;
        switch (sortBy) {
          case 'price-low':  return toNum(a.price) - toNum(b.price);
          case 'price-high': return toNum(b.price) - toNum(a.price);
          case 'name':       return a.name.localeCompare(b.name);
          case 'newest':     return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
          default:           return (a.isSale ? 1 : 0) - (b.isSale ? 1 : 0);
        }
      });

    return out;
  }, [allProducts, filters, sortBy]);

  return (
    <div className="min-h-screen bg-white pt-20">
      <FilterBar
        totalItems={filteredProducts.length}
        onViewModeChange={setViewMode}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        sortBy={sortBy}
        products={allProducts}
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
