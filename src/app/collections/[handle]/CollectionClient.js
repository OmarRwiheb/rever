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

// Helper function to extract colors from variants
const extractColorsFromVariants = (variantNodes) => {
  // Prefer explicit "Color" option; fallback to last segment in title ("Size / Color")
  const colorByOption = variantNodes
    .map((v) => v.selectedOptions?.find((o) => o.name.toLowerCase() === 'color')?.value)
    .filter(Boolean);
  if (colorByOption.length) return Array.from(new Set(colorByOption));

  return Array.from(
    new Set(
      variantNodes
        .map((v) => v.title)
        .filter((t) => t && t !== 'Default Title')
        .map((t) => {
          const parts = t.split(' / ');
          return parts[parts.length - 1] || t;
        })
        .filter(Boolean)
    )
  );
};

// Map Storefront product node -> your grid item shape
function mapNodeToCard(node) {
  const minPrice = node?.priceRange?.minVariantPrice?.amount;
  const currency = node?.priceRange?.minVariantPrice?.currencyCode || DEFAULT_CURRENCY;

  const sizeOpt =
    (node?.options || []).find((o) =>
      String(o?.name || '').toLowerCase().includes('size')
    )?.values || [DEFAULT_SIZE];

  // Extract colors from variants
  const variantNodes = (node?.variants?.edges || []).map(e => e.node);
  const colors = extractColorsFromVariants(variantNodes);
  const primaryColor = colors[0] || DEFAULT_COLOR;

  const handle = node?.handle || String(node?.id || '').split('/').pop();
  const href = handle ? `/products/${handle}` : '#';

  // Transform variants data for cart operations
  const variants = (node?.variants?.edges || []).map((e) => {
    const variant = e.node;
    const selectedOptions = variant.selectedOptions || [];
    const colorOption = selectedOptions.find(opt => 
      opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('colour')
    );
    const sizeOption = selectedOptions.find(opt => 
      opt.name.toLowerCase().includes('size')
    );
    
    return {
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      color: colorOption?.value || primaryColor,
      size: sizeOption?.value || DEFAULT_SIZE,
      selectedOptions: selectedOptions
    };
  });

  return {
    id: node.id,
    slug: handle,                 // keep if you use it elsewhere
    href,                         // ✅ add this
    name: node.title,
    imageUrl: node?.featuredImage?.url || '/img/product-test.jpg',
    images: node?.featuredImage?.url ? [node.featuredImage.url] : [],
    price: toPriceString(minPrice, currency),
    originalPrice: null,
    isNew: false,
    isSale: false,
    description: node?.description || '',
    color: primaryColor.toUpperCase(),
    colors: colors.map(c => c.toString().toUpperCase()),
    reference: `REF. ${String(node.id).split('/').pop()}`,
    sizes: sizeOpt,
    modelInfo: '',
    discountPercentage: 0,
    variants: variants, // Add variants for quick add functionality
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
        if (filters.colors.length > 0) {
          const hasMatchingColor = p.colors?.some((c) => filters.colors.includes(c));
          if (!hasMatchingColor) return false;
        }
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
