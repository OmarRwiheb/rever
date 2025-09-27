// services/shopify/shopifyBlog.js
import { apiClient } from '../axios';

// ---- GraphQL Fragments ----
const ARTICLE_FIELDS = `
  id
  title
  handle
  contentHtml
  publishedAt
  createdAt
  updatedAt
  author {
    name
  }
  tags
  image {
    url
    altText
  }
  blog {
    id
    title
    handle
  }
`;

// ---- GraphQL Queries ----
// Direct articles query (this is much better!)
const ARTICLES_QUERY = `
  query Articles {
    articles(first: 250) {
      nodes {
        id
        title
        handle
        content
        contentHtml
        excerpt
        excerptHtml
        publishedAt
        tags
        onlineStoreUrl
        image {
          url
        }
        author {
          name
        }
      }
    }
  }
`;

// Fallback blogs query (keep as backup)
const BLOGS_QUERY = `
  query Blogs {
    blogs(first: 250) {
      edges {
        node {
          id
          handle
          title
          articles(first: 250) {
            edges {
              node {
                id
                title
                contentHtml
                image {
                  url
                }
                author {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ARTICLE_BY_HANDLE_QUERY = `
  query ArticleByHandle($handle: String!) {
    article(handle: $handle) {
      id
      title
      handle
      content
      contentHtml
      excerpt
      excerptHtml
      publishedAt
      tags
      onlineStoreUrl
      image {
        url
      }
      author {
        name
      }
    }
  }
`;

const ARTICLE_BY_ID_QUERY = `
  query ArticleById($id: ID!) {
    article(id: $id) {
      id
      title
      handle
      content
      contentHtml
      excerpt
      excerptHtml
      publishedAt
      tags
      onlineStoreUrl
      image {
        url
      }
      author {
        name
      }
    }
  }
`;

// ---- Helper Functions ----
const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString();
};

const encodeGlobalId = (globalId) => {
  if (!globalId) return null;
  return encodeURIComponent(globalId);
};

const decodeGlobalId = (encodedId) => {
  if (!encodedId) return null;
  return decodeURIComponent(encodedId);
};

const extractExcerpt = (content, maxLength = 200) => {
  if (!content) return '';
  
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // If content is shorter than maxLength, return as is
  if (plainText.length <= maxLength) return plainText;
  
  // Find the last complete word within maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
};

const extractTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter(Boolean).map(tag => tag.toString().trim());
};

// ---- Transformer ----
const transformArticle = (article) => {
  if (!article) return null;

  return {
    id: article.id,
    encodedId: encodeGlobalId(article.id),
    handle: article.handle || 'untitled',
    title: article.title || 'Untitled',
    excerpt: article.excerpt || extractExcerpt(article.contentHtml),
    content: article.contentHtml || article.content || '',
    author: article.author?.name || 'Unknown Author',
    publishedAt: formatDate(article.publishedAt) || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: extractTags(article.tags),
    featuredImage: article.image?.url || '/img/lookbook.jpg',
    imageAlt: article.title || 'Article image',
    blog: {
      id: null,
      title: 'Blog',
      handle: 'blog'
    }
  };
};

// ---- Public Service Functions ----

/**
 * Get all articles with pagination
 * @param {number} first - Number of articles to fetch
 * @param {string} after - Cursor for pagination
 * @param {string} query - Search query (optional)
 * @returns {Promise<{articles: Array, pageInfo: Object}>}
 */
export async function getArticles(first = 10, after = null, query = null) {
  try {
    console.log('Fetching articles with params:', { first, after, query: query || null });
    
    // Use the direct articles query (this is much better!)
    const data = await apiClient.graphql(ARTICLES_QUERY);
    console.log('Articles API response:', data);
    
    const articlesData = data?.articles?.nodes || [];
    if (articlesData.length === 0) {
      throw new Error('No articles found in Shopify store');
    }
    
    // Sort articles by published date (newest first)
    articlesData.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0);
      const dateB = new Date(b.publishedAt || 0);
      return dateB - dateA;
    });
    
    // Apply pagination
    const startIndex = 0;
    const endIndex = Math.min(startIndex + first, articlesData.length);
    const paginatedArticles = articlesData.slice(startIndex, endIndex);
    
    const articles = paginatedArticles.map(article => transformArticle(article));
    const pageInfo = { 
      hasNextPage: endIndex < articlesData.length, 
      endCursor: null
    };

    console.log('Transformed articles:', articles.length, 'articles found');
    return { articles, pageInfo };
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

/**
 * Get a single article by handle
 * @param {string} handle - Article handle
 * @returns {Promise<Object>}
 */
export async function getArticleByHandle(handle) {
  try {
    console.log('Fetching article by handle:', handle);
    
    // Use the direct article query
    const data = await apiClient.graphql(ARTICLE_BY_HANDLE_QUERY, { handle });
    console.log('Article API response:', data);
    
    if (!data?.article) {
      throw new Error('Article not found');
    }
    
    return transformArticle(data.article);
  } catch (error) {
    console.error('Error fetching article by handle:', error);
    throw error;
  }
}

/**
 * Get a single article by ID
 * @param {string} id - Article ID
 * @returns {Promise<Object>}
 */
export async function getArticleById(id) {
  try {
    console.log('Fetching article by ID:', id);
    
    const data = await apiClient.graphql(ARTICLE_BY_ID_QUERY, { id });
    console.log('Article by ID API response:', data);
    
    if (!data?.article) {
      throw new Error('Article not found');
    }
    
    return transformArticle(data.article);
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
}

/**
 * Get articles from a specific blog
 * @param {string} blogHandle - Blog handle
 * @returns {Promise<Array>}
 */
export async function getBlogArticles(blogHandle) {
  try {
    const data = await apiClient.graphql(BLOG_QUERY, { handle: blogHandle });
    
    if (!data?.blog?.articles?.edges) {
      throw new Error('Blog not found or no articles');
    }
    
    return data.blog.articles.edges.map(edge => transformArticle(edge.node));
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    throw error;
  }
}

/**
 * Get related articles (excluding current article)
 * @param {string} currentArticleId - Current article ID
 * @param {number} limit - Number of related articles to return
 * @returns {Promise<Array>}
 */
export async function getRelatedArticles(currentArticleId, limit = 3) {
  try {
    console.log('Fetching related articles for:', currentArticleId);
    
    // Get all articles and filter out the current one
    const { articles } = await getArticles(50); // Get more articles to have better selection
    const relatedArticles = articles
      .filter(article => article.id !== currentArticleId)
      .slice(0, limit);
    
    console.log('Found related articles:', relatedArticles.length);
    return relatedArticles;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}
