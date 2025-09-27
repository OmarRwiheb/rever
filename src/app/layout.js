import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar, { NavbarProvider } from "@/components/Navbar";
import NewsletterPopup from "@/components/NewsletterPopup";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import RecaptchaProvider from "@/components/RecaptchaProvider";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Rever - Premium Fashion & Lifestyle",
    template: "%s | Rever"
  },
  description: "Discover the latest in premium fashion and lifestyle. Shop our curated collection of clothing, accessories, and more.",
  keywords: ["fashion", "clothing", "lifestyle", "premium", "style", "shopping"],
  authors: [{ name: "Rever" }],
  creator: "Rever",
  publisher: "Rever",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com', // Replace with your actual domain
    title: 'Rever - Premium Fashion & Lifestyle',
    description: 'Discover the latest in premium fashion and lifestyle. Shop our curated collection of clothing, accessories, and more.',
    siteName: 'Rever',
    images: [
      {
        url: '/og-image.jpg', // Add your Open Graph image
        width: 1200,
        height: 630,
        alt: 'Rever - Premium Fashion & Lifestyle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rever - Premium Fashion & Lifestyle',
    description: 'Discover the latest in premium fashion and lifestyle. Shop our curated collection of clothing, accessories, and more.',
    images: ['/twitter-image.jpg'], // Add your Twitter image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* <RecaptchaProvider> */}
          <NavbarProvider>
            <UserProvider>
              <CartProvider>
                <WishlistProvider>
                  <Navbar />
                  {children}
                </WishlistProvider>
              </CartProvider>
            </UserProvider>
          </NavbarProvider>
          <NewsletterPopup />
          <WhatsAppSupport />
        {/* </RecaptchaProvider> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              if (typeof window !== 'undefined') {
                const body = document.body;
                if (body) {
                  // Remove common browser extension attributes
                  body.removeAttribute('data-new-gr-c-s-check-loaded');
                  body.removeAttribute('data-gr-ext-installed');
                  body.removeAttribute('data-gramm');
                  body.removeAttribute('data-gramm_editor');
                  body.removeAttribute('data-gramm_editor_plugin');
                  body.removeAttribute('data-gramm_editor_plugin_grammarly');
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}