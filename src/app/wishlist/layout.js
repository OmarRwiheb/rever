export const metadata = {
  title: 'Wishlist',
  description: 'View and manage your Rever wishlist. Save your favorite fashion items and accessories for later purchase.',
  keywords: ['wishlist', 'saved items', 'favorites', 'shopping list'],
  openGraph: {
    title: 'Wishlist | Rever',
    description: 'View and manage your Rever wishlist. Save your favorite fashion items for later.',
    images: [
      {
        url: '/wishlist-og.jpg', // Add your wishlist Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Wishlist - Saved Items',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wishlist | Rever',
    description: 'View and manage your Rever wishlist. Save your favorite fashion items for later.',
    images: ['/wishlist-twitter.jpg'], // Add your wishlist Twitter image
  },
};

export default function WishlistLayout({ children }) {
  return <>{children}</>;
}
