export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Rever\'s customer service team. Find store locations, contact information, and support for all your fashion needs.',
  keywords: ['contact us', 'customer service', 'store locations', 'support', 'help'],
  openGraph: {
    title: 'Contact Us | Rever',
    description: 'Get in touch with Rever\'s customer service team. Find store locations and support.',
    images: [
      {
        url: '/contact-og.jpg', // Add your contact page Open Graph image
        width: 1200,
        height: 630,
        alt: 'Contact Rever - Customer Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Rever',
    description: 'Get in touch with Rever\'s customer service team. Find store locations and support.',
    images: ['/contact-twitter.jpg'], // Add your contact page Twitter image
  },
};

export default function ContactLayout({ children }) {
  return <>{children}</>;
}
