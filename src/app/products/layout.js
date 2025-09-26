export const metadata = {
  title: 'Products',
  description: 'Shop the latest products from Rever. Browse our complete collection of premium fashion items, accessories, and lifestyle products.',
  keywords: ['products', 'shop', 'fashion items', 'accessories', 'premium products'],
  openGraph: {
    title: 'Products | Rever',
    description: 'Shop the latest products from Rever. Browse our complete collection of premium fashion items.',
    images: [
      {
        url: '/products-og.jpg', // Add your products Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Products - Premium Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | Rever',
    description: 'Shop the latest products from Rever. Browse our complete collection of premium fashion items.',
    images: ['/products-twitter.jpg'], // Add your products Twitter image
  },
};

export default function ProductsLayout({ children }) {
  return <>{children}</>;
}
