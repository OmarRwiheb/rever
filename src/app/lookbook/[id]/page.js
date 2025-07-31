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
      { id: 'jacket-1', name: 'BOMBER JACKET IN AGED LAMBSKIN', price: '$2,500', image: '/img/product-test.jpg' },
      { id: 'shirt-1', name: 'BRODERIE ANGLAISE PAJAMA SET IN COTTON', price: '$450', image: '/img/product-test.jpg' },
      { id: 'belt-1', name: 'CHAIN BELT IN METAL AND RESIN', price: '$680', image: '/img/product-test.jpg' },
      { id: 'sunglasses-1', name: 'SL 831 VESPER', price: '$890', image: '/img/product-test.jpg' },
      { id: 'shoes-1', name: 'SLINGBACK PUMP IN NUDE', price: '$720', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 2,
    image: '/img/lookbook.jpg',
    title: 'Evening Elegance',
    description: 'Black leather jacket with red skirt',
    products: [
      { id: 'jacket-2', name: 'BLACK LEATHER JACKET', price: '$1,800', image: '/img/product-test.jpg' },
      { id: 'skirt-2', name: 'RED SILK SKIRT', price: '$750', image: '/img/product-test.jpg' },
      { id: 'shoes-2', name: 'STILETTO HEELS', price: '$650', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 3,
    image: '/img/lookbook.jpg',
    title: 'Casual Chic',
    description: 'Patterned blazer with teal skirt',
    products: [
      { id: 'blazer-3', name: 'PATTERNED BLAZER', price: '$1,200', image: '/img/product-test.jpg' },
      { id: 'skirt-3', name: 'TEAL PENCIL SKIRT', price: '$580', image: '/img/product-test.jpg' },
      { id: 'shoes-3', name: 'LOAFERS', price: '$420', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 4,
    image: '/img/lookbook.jpg',
    title: 'Summer Breeze',
    description: 'Light pink flowing dress',
    products: [
      { id: 'dress-4', name: 'PINK FLOWING DRESS', price: '$1,350', image: '/img/product-test.jpg' },
      { id: 'shoes-4', name: 'SANDALS', price: '$380', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 5,
    image: '/img/lookbook.jpg',
    title: 'Monochrome Magic',
    description: 'Black suit with statement pieces',
    products: [
      { id: 'suit-5', name: 'BLACK TAILORED SUIT', price: '$2,800', image: '/img/product-test.jpg' },
      { id: 'shoes-5', name: 'OXFORD SHOES', price: '$720', image: '/img/product-test.jpg' },
      { id: 'bag-5', name: 'LEATHER BAG', price: '$950', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 6,
    image: '/img/lookbook.jpg',
    title: 'Urban Sophistication',
    description: 'Brown bomber jacket with patterned pants',
    products: [
      { id: 'jacket-6', name: 'BROWN BOMBER JACKET', price: '$1,650', image: '/img/product-test.jpg' },
      { id: 'pants-6', name: 'PATTERNED PANTS', price: '$520', image: '/img/product-test.jpg' },
      { id: 'shoes-6', name: 'SNEAKERS', price: '$480', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 7,
    image: '/img/lookbook.jpg',
    title: 'Winter Warmth',
    description: 'Faux fur coat with slip dress',
    products: [
      { id: 'coat-7', name: 'FAUX FUR COAT', price: '$2,100', image: '/img/product-test.jpg' },
      { id: 'dress-7', name: 'SILK SLIP DRESS', price: '$890', image: '/img/product-test.jpg' },
      { id: 'shoes-7', name: 'ANKLE BOOTS', price: '$720', image: '/img/product-test.jpg' }
    ]
  },
  {
    id: 8,
    image: '/img/lookbook.jpg',
    title: 'Classic Elegance',
    description: 'Trench coat with light blue pants',
    products: [
      { id: 'coat-8', name: 'BEIGE TRENCH COAT', price: '$2,300', image: '/img/product-test.jpg' },
      { id: 'pants-8', name: 'LIGHT BLUE PANTS', price: '$680', image: '/img/product-test.jpg' },
      { id: 'shoes-8', name: 'BLACK BOOTS', price: '$890', image: '/img/product-test.jpg' }
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
                  <div key={product.id} className="w-[110px] md:w-[160px] space-y-2 mb-4 md:mb-8">
                    <div className="bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                        {product.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 