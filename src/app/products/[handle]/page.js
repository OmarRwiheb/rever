'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import ProductImage from '../../../components/product/ProductImage';
import ProductInfo from '../../../components/product/ProductInfo';
import ProductHighlights from '../../../components/product/ProductHighlights';
import RelatedProducts from '../../../components/product/RelatedProducts';
import MobileStickyCart from '../../../components/product/MobileStickyCart';
import Footer from '../../../components/Footer';
import LoadingScreen from '../../../components/LoadingScreen';

import { shopifyService } from '@/services/shopify/shopify'; // make sure this re-exports getProductByHandle/getProductById

// ————— Helpers —————
function toShopifyGID(numericId) {
  if (!numericId) return null;
  return `gid://shopify/Product/${numericId}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [originalButtonsRef, setOriginalButtonsRef] = useState(null);

  // Prefer /products/[handle]
  const { handleParam, idParam } = useMemo(() => {
    // Support both route styles:
    // - params.handle (recommended)
    // - params.id (legacy numeric) -> convert to GID
    let handleParam = typeof params?.handle === 'string' ? params.handle : '';
    if (!handleParam && Array.isArray(params?.handle) && params.handle.length) {
      handleParam = params.handle[params.handle.length - 1];
    }
    const idParam = typeof params?.id === 'string' ? params.id : '';

    // Fallback: derive handle from pathname if needed
    if (!handleParam && pathname) {
      const parts = pathname.split('/').filter(Boolean);
      // /products/[handle]
      if (parts[0] === 'products' && parts[1]) handleParam = parts[1];
    }

    return { handleParam, idParam };
  }, [params, pathname]);

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product
  useEffect(() => {
    let mounted = true;
    setErr(null);

    // Only fire once we have either a handle or an id
    if (!handleParam && !idParam) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        let p;
        if (handleParam) {
          // ✅ Best: by handle
          p = await shopifyService.getProductByHandle(handleParam);
        } else {
          // Legacy numeric id -> GID
          const gid = toShopifyGID(idParam);
          p = await shopifyService.getProductById(gid);
        }

        if (!mounted) return;
        setProduct(p);
        // Set initial selected color
        if (p.colors && p.colors.length > 0) {
          setSelectedColor(p.colors[0]);
        }
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        console.error('Product fetch failed:', e);
        setErr('Product not found');
        setProduct(null);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [handleParam, idParam]);

  // Handle color selection from ProductInfo
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  // Handle size selection from ProductInfo
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  // Handle quantity change from ProductInfo
  const handleQuantityChange = (qty) => {
    setQuantity(qty);
  };

  // Handle ref from ProductInfo
  const handleButtonsRef = (ref) => {
    setOriginalButtonsRef(ref);
  };

  if (loading) {
    return <LoadingScreen message="Loading product..." />;
  }

  if (err || !product) {
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
        {/* Product Image */}
        <div className="w-full lg:w-1/2 2xl:w-2/3 lg:sticky lg:top-0 lg:h-screen">
          <ProductImage product={product} selectedColor={selectedColor} />
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 2xl:w-1/3">
          <div className="px-4 lg:px-8 py-8">
            <ProductInfo 
              product={product} 
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              quantity={quantity}
              onColorChange={handleColorChange}
              onSizeChange={handleSizeChange}
              onQuantityChange={handleQuantityChange}
              onButtonsRef={handleButtonsRef}
            />
            <ProductHighlights product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="w-full px-4 lg:px-8 py-8">
        <RelatedProducts product={product} />
      </div>

      <Footer />
      
      {/* Mobile Sticky Cart */}
      <MobileStickyCart 
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
        onColorChange={handleColorChange}
        originalButtonsRef={originalButtonsRef}
      />
    </div>
  );
}
