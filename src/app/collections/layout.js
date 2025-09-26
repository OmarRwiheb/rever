export const metadata = {
  title: 'Collections',
  description: 'Explore Rever\'s curated fashion collections. Discover our latest clothing, accessories, and lifestyle products organized by category and style.',
  keywords: ['collections', 'fashion collections', 'clothing', 'accessories', 'lifestyle products'],
  openGraph: {
    title: 'Collections | Rever',
    description: 'Explore Rever\'s curated fashion collections. Discover our latest clothing and accessories.',
    images: [
      {
        url: '/collections-og.jpg', // Add your collections Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Collections - Fashion & Accessories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections | Rever',
    description: 'Explore Rever\'s curated fashion collections. Discover our latest clothing and accessories.',
    images: ['/collections-twitter.jpg'], // Add your collections Twitter image
  },
};

export default function CollectionsLayout({ children }) {
  return <>{children}</>;
}
