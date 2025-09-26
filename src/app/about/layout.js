export const metadata = {
  title: 'About Us',
  description: 'Learn about Rever\'s brand story, values, and commitment to premium fashion and lifestyle. Discover our heritage of innovation and craftsmanship.',
  keywords: ['about us', 'brand story', 'company values', 'fashion heritage', 'luxury brand'],
  openGraph: {
    title: 'About Us | Rever',
    description: 'Learn about Rever\'s brand story, values, and commitment to premium fashion and lifestyle.',
    images: [
      {
        url: '/about-og.jpg', // Add your about page Open Graph image
        width: 1200,
        height: 630,
        alt: 'About Rever - Premium Fashion Brand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Rever',
    description: 'Learn about Rever\'s brand story, values, and commitment to premium fashion and lifestyle.',
    images: ['/about-twitter.jpg'], // Add your about page Twitter image
  },
};

export default function AboutLayout({ children }) {
  return <>{children}</>;
}
