'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag } from 'lucide-react';
import { shopifyService } from '../../services/shopify/shopify';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (after = null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const { articles: fetchedArticles, pageInfo: fetchedPageInfo } = await shopifyService.getArticles(10, after);
      
      if (append) {
        setArticles(prev => [...prev, ...fetchedArticles]);
      } else {
        setArticles(fetchedArticles);
      }
      
      setPageInfo(fetchedPageInfo);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      fetchArticles(pageInfo.endCursor, true);
    }
  };

  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchArticles()}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {sortedArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {sortedArticles.map((article) => (
              <article key={article.id} className="group">
                <Link href={`/blog/${article.encodedId}`}>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Article Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={article.featuredImage}
                        alt={article.imageAlt || article.title}
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
        )}

        {/* Load More Button */}
        {pageInfo.hasNextPage && (
          <div className="text-center mt-16">
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading...' : 'Load More Articles'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}