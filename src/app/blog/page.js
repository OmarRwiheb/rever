'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag } from 'lucide-react';

// Mock data - this will be replaced with actual Shopify API calls
const mockArticles = [
  {
    id: '1',
    title: 'The Art of Minimalist Fashion',
    excerpt: 'Discover how to build a timeless wardrobe with essential pieces that never go out of style.',
    content: 'Full article content here...',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-15T10:00:00Z',
    tags: ['Fashion', 'Minimalism', 'Style'],
    featuredImage: '/img/lookbook.jpg',
    handle: 'art-of-minimalist-fashion'
  },
  {
    id: '2',
    title: 'Sustainable Fashion: A Guide to Ethical Shopping',
    excerpt: 'Learn about sustainable fashion practices and how to make conscious choices when shopping.',
    content: 'Full article content here...',
    author: 'Emma Davis',
    publishedAt: '2024-01-10T14:30:00Z',
    tags: ['Sustainability', 'Ethical Fashion', 'Shopping'],
    featuredImage: '/img/women.jpg',
    handle: 'sustainable-fashion-guide'
  },
  {
    id: '3',
    title: 'Building Your Capsule Wardrobe',
    excerpt: 'Step-by-step guide to creating a versatile capsule wardrobe that works for every occasion.',
    content: 'Full article content here...',
    author: 'Michael Chen',
    publishedAt: '2024-01-05T09:15:00Z',
    tags: ['Capsule Wardrobe', 'Organization', 'Style'],
    featuredImage: '/img/placeholder.js',
    handle: 'building-capsule-wardrobe'
  },
  {
    id: '4',
    title: 'The Psychology of Color in Fashion',
    excerpt: 'Understanding how colors affect mood and perception in fashion choices.',
    content: 'Full article content here...',
    author: 'Lisa Rodriguez',
    publishedAt: '2024-01-01T16:45:00Z',
    tags: ['Color Theory', 'Psychology', 'Fashion'],
    featuredImage: '/img/men.jpg',
    handle: 'psychology-color-fashion'
  },
  {
    id: '5',
    title: 'Seasonal Style Transitions',
    excerpt: 'Tips for seamlessly transitioning your wardrobe between seasons.',
    content: 'Full article content here...',
    author: 'David Kim',
    publishedAt: '2023-12-28T11:20:00Z',
    tags: ['Seasonal', 'Transitions', 'Style Tips'],
    featuredImage: '/img/product-test.jpg',
    handle: 'seasonal-style-transitions'
  },
  {
    id: '6',
    title: 'Fashion Trends vs. Timeless Style',
    excerpt: 'Finding the balance between following trends and maintaining timeless elegance.',
    content: 'Full article content here...',
    author: 'Anna Thompson',
    publishedAt: '2023-12-25T13:10:00Z',
    tags: ['Trends', 'Timeless', 'Style Philosophy'],
    featuredImage: '/img/zoom.jpg',
    handle: 'fashion-trends-vs-timeless'
  }
];

export default function BlogPage() {
  // Sort articles by date (newest first)
  const sortedArticles = [...mockArticles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover insights, tips, and stories about fashion, style, and lifestyle.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid gap-12">
          {sortedArticles.map((article) => (
            <article key={article.id} className="group">
              <Link href={`/blog/${article.handle}`}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Article Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Article Content */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-light text-gray-900 group-hover:text-gray-700 transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-gray-600 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors font-medium">
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  );
}