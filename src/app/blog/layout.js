export const metadata = {
  title: 'Blog',
  description: 'Discover the latest fashion trends, styling tips, and behind-the-scenes content from Rever. Stay updated with our fashion blog and lifestyle insights.',
  keywords: ['fashion blog', 'style tips', 'fashion trends', 'lifestyle', 'fashion news'],
  openGraph: {
    title: 'Blog | Rever',
    description: 'Discover the latest fashion trends, styling tips, and behind-the-scenes content from Rever.',
    images: [
      {
        url: '/blog-og.jpg', // Add your blog Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever Blog - Fashion & Lifestyle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Rever',
    description: 'Discover the latest fashion trends, styling tips, and behind-the-scenes content from Rever.',
    images: ['/blog-twitter.jpg'], // Add your blog Twitter image
  },
};

export default function BlogLayout({ children }) {
  return <>{children}</>;
}
