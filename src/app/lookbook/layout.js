export const metadata = {
  title: 'Lookbooks',
  description: 'Explore our curated lookbooks featuring the latest fashion trends and styling inspiration. Discover complete outfits and shop the looks you love.',
  keywords: ['lookbooks', 'fashion', 'styling', 'outfits', 'trends', 'inspiration'],
  openGraph: {
    title: 'Lookbooks | Rever',
    description: 'Explore our curated lookbooks featuring the latest fashion trends and styling inspiration.',
    images: [
      {
        url: '/lookbook-og.jpg', // Add your lookbook Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Lookbooks - Fashion Inspiration',
      },
    ],
  },
  twitter: {
    title: 'Lookbooks | Rever',
    description: 'Explore our curated lookbooks featuring the latest fashion trends and styling inspiration.',
    images: ['/lookbook-twitter.jpg'], // Add your lookbook Twitter image
  },
};

export default function LookbookLayout({ children }) {
  return children;
}
