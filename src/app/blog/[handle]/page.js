'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { shopifyService } from '../../../services/shopify/shopify';

export default function ArticlePage({ params }) {
  const { handle: articleId } = params; // Rename to articleId for clarity
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch article and related articles on component mount
  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Decode the global ID from the URL
      const decodedId = decodeURIComponent(articleId);
      const fetchedArticle = await shopifyService.getArticleById(decodedId);
      setArticle(fetchedArticle);
      
      // Fetch related articles
      const related = await shopifyService.getRelatedArticles(
        fetchedArticle.id, 
        3
      );
      setRelatedArticles(related);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Article not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state or article not found
  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">
            {error || 'Article Not Found'}
          </h1>
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

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
            alt={article.imageAlt || article.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="blog-content">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
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
                  <Link href={`/blog/${relatedArticle.encodedId}`}>
                    <div className="space-y-4">
                      {/* Article Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={relatedArticle.featuredImage}
                          alt={relatedArticle.imageAlt || relatedArticle.title}
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