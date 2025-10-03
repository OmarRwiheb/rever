import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
      },
    ],
    // Optimize images for mobile
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Optimize for mobile performance
  experimental: {
    optimizeCss: false, // Disable to avoid critters dependency
    optimizePackageImports: ['gsap', 'lucide-react'],
  },
  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Compress output
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  // Optimize for mobile
  output: 'standalone',
  // Optimize chunks
  webpack: (config, { isServer, dev }) => {
    // Ensure GSAP works properly in production builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Handle GSAP plugins properly
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Optimize chunks for mobile
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          gsap: {
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            name: 'gsap',
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  transpilePackages: ['gsap'],
};

export default nextConfig;
