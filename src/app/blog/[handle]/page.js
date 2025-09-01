'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

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

export default function ArticlePage({ params }) {
  const { handle } = params;
  
  // Find the article by handle
  const article = mockArticles.find(article => article.handle === handle);
  
  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Get related articles (exclude current article)
  const relatedArticles = mockArticles
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-6">
          {/* Tags */}
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

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
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
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {article.excerpt}
          </p>
          
          <div className="text-gray-900 leading-relaxed space-y-6">
            <p>
              This is where the full article content would be displayed. In a real implementation, 
              this would come from the Shopify API and contain the complete article text, images, 
              and formatting.
            </p>
            
            <p>
              The content would be properly formatted with headings, paragraphs, lists, and other 
              rich text elements as provided by the Shopify blog system.
            </p>
            
            <p>
              For now, this is placeholder content to demonstrate the layout and styling of the 
              blog article page.
            </p>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-light text-gray-900 mb-8">Related Articles</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <article key={relatedArticle.id} className="group">
                  <Link href={`/blog/${relatedArticle.handle}`}>
                    <div className="space-y-4">
                      {/* Article Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={relatedArticle.featuredImage}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Article Content */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-light text-gray-900 group-hover:text-gray-700 transition-colors">
                          {relatedArticle.title}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed">
                          {relatedArticle.excerpt}
                        </p>

                        <div className="flex items-center text-xs text-gray-500">
                          <span>{relatedArticle.author}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(relatedArticle.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}