'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data for lookbook outfits (same as main page)
const lookbookOutfits = [
  {
    id: 1,
    image: '/img/lookbook.jpg',
    title: 'Autumn Collection',
    description: 'Brown leather bomber jacket with cream patterned pants',
    products: [
      { id: 1, name: 'Checked Top with Asymmetric Neckline', price: 'EGP 2,990.00', image: '/img/product-test.jpg' },
      { id: 2, name: 'Mid-Rise Wide-Leg Full Length Jeans', price: 'EGP 2,490.00', image: '/img/product-test.jpg' },
      { id: 3, name: 'Rhinestone Leather Sandals', price: 'EGP 1,990.00', image: '/img/product-test.jpg' },
      { id: 4, name: 'Oval Hoop Earrings', price: 'EGP 1,790.00', image: '/img/product-test.jpg' },
      { id: 5, name: 'Evening Gown', price: 'EGP 3,299.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 2,
    image: '/img/lookbook.jpg',
    title: 'Evening Elegance',
    description: 'Black leather jacket with red skirt',
    products: [
      { id: 6, name: 'Summer Maxi Dress', price: 'EGP 2,199.00', image: '/img/product-test.jpg' },
      { id: 30, name: 'Elegant Cocktail Dress', price: 'EGP 2,399.00', image: '/img/product-test.jpg' },
      { id: 31, name: 'Summer Maxi Dress', price: 'EGP 2,199.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 3,
    image: '/img/lookbook.jpg',
    title: 'Casual Chic',
    description: 'Patterned blazer with teal skirt',
    products: [
      { id: 32, name: 'Formal Business Dress', price: 'EGP 2,799.00', image: '/img/product-test.jpg' },
      { id: 33, name: 'Casual Weekend Dress', price: 'EGP 1,599.00', image: '/img/product-test.jpg' },
      { id: 34, name: 'Elegant Evening Dress', price: 'EGP 3,299.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 4,
    image: '/img/lookbook.jpg',
    title: 'Summer Breeze',
    description: 'Light pink flowing dress',
    products: [
      { id: 35, name: 'Summer Boho Dress', price: 'EGP 1,899.00', image: '/img/product-test.jpg' },
      { id: 36, name: 'Cocktail Party Dress', price: 'EGP 2,299.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 5,
    image: '/img/lookbook.jpg',
    title: 'Monochrome Magic',
    description: 'Black suit with statement pieces',
    products: [
      { id: 1, name: 'Checked Top with Asymmetric Neckline', price: 'EGP 2,990.00', image: '/img/product-test.jpg' },
      { id: 2, name: 'Mid-Rise Wide-Leg Full Length Jeans', price: 'EGP 2,490.00', image: '/img/product-test.jpg' },
      { id: 3, name: 'Rhinestone Leather Sandals', price: 'EGP 1,990.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 6,
    image: '/img/lookbook.jpg',
    title: 'Urban Sophistication',
    description: 'Brown bomber jacket with patterned pants',
    products: [
      { id: 4, name: 'Oval Hoop Earrings', price: 'EGP 1,790.00', image: '/img/product-test.jpg' },
      { id: 5, name: 'Evening Gown', price: 'EGP 3,299.00', image: '/img/product-test.jpg' },
      { id: 6, name: 'Summer Maxi Dress', price: 'EGP 2,199.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 7,
    image: '/img/lookbook.jpg',
    title: 'Winter Warmth',
    description: 'Faux fur coat with slip dress',
    products: [
      { id: 30, name: 'Elegant Cocktail Dress', price: 'EGP 2,399.00', image: '/img/product-test.jpg' },
      { id: 31, name: 'Summer Maxi Dress', price: 'EGP 2,199.00', image: '/img/product-test.jpg' },
      { id: 32, name: 'Formal Business Dress', price: 'EGP 2,799.00', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 8,
    image: '/img/lookbook.jpg',
    title: 'Classic Elegance',
    description: 'Trench coat with light blue pants',
    products: [
      { id: 33, name: 'Casual Weekend Dress', price: 'EGP 1,599.00', image: '/img/product-test.jpg' },
      { id: 34, name: 'Elegant Evening Dress', price: 'EGP 3,299.00', image: '/img/product-test.jpg' },
      { id: 35, name: 'Summer Boho Dress', price: 'EGP 1,899.00', image: '/img/product-test.jpg' }
    ]
  }
];

export default function OutfitDetailPage() {
  const params = useParams();
  const outfitId = parseInt(params.id);
  const outfit = lookbookOutfits.find(o => o.id === outfitId);

  if (!outfit) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Outfit not found</h1>
          <Link href="/lookbook" className="text-blue-600 hover:text-blue-800">
            Back to Lookbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative pt-20">
      {/* Main Content */}
      <div className="flex h-full justify-center">
        <div className="max-w-7xl w-full flex mx-4 md:mx-16 my-4 md:my-16 gap-4 md:gap-20 flex-col lg:flex-row">
          {/* Left Side - Large Outfit Photo */}
          <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full">
            <div className="w-full h-full">
              <img
                src={outfit.image}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Product Grid */}
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white">
            <div className="space-y-4 md:space-y-8">
              {/* Product Flex */}
              <div className="flex flex-wrap justify-around md:justify-start gap-2 md:gap-4">
                {outfit.products.map((product, index) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className="w-[110px] md:w-[160px] space-y-2 mb-4 md:mb-8 group cursor-pointer">
                      <div className="bg-gray-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-900 uppercase tracking-wide group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 