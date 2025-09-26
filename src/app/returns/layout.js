export const metadata = {
  title: 'Returns & Exchanges',
  description: 'Learn about Rever\'s return and exchange policy. Find information about returns, exchanges, and refunds for your purchases.',
  keywords: ['returns', 'exchanges', 'refunds', 'return policy', 'customer service'],
  openGraph: {
    title: 'Returns & Exchanges | Rever',
    description: 'Learn about Rever\'s return and exchange policy. Easy returns and exchanges.',
    images: [
      {
        url: '/returns-og.jpg', // Add your returns Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Returns - Easy Returns & Exchanges',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Returns & Exchanges | Rever',
    description: 'Learn about Rever\'s return and exchange policy. Easy returns and exchanges.',
    images: ['/returns-twitter.jpg'], // Add your returns Twitter image
  },
};

export default function ReturnsLayout({ children }) {
  return <>{children}</>;
}
