// lib/storageHandler.js
/**
 * General Storage Handler for caching any type of data
 * Provides memory cache, localStorage persistence, and automatic refresh
 */

class StorageHandler {
  constructor(options = {}) {
    this.defaultTTL = options.defaultTTL || 12 * 60 * 60 * 1000; // 12 hours default
    this.defaultVersion = options.defaultVersion || '1.0';
    this.isClient = typeof window !== 'undefined';
    
    // Memory cache storage
    this.memoryCache = new Map();
  }

  /**
   * Generate cache key with namespace
   * @param {string} namespace - Cache namespace (e.g., 'navbar', 'products', 'collections')
   * @param {string} key - Specific cache key
   * @returns {string} Full cache key
   */
  generateCacheKey(namespace, key) {
    return `${namespace}_${key}_cache`;
  }

  /**
   * Get cached data from memory first, then localStorage
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in milliseconds
   * @returns {any|null} Cached data or null if not available/expired
   */
  getCachedData(namespace, key, ttl = this.defaultTTL) {
    const cacheKey = this.generateCacheKey(namespace, key);
    
    // Check memory cache first
    if (this.isMemoryCacheValid(namespace, key, ttl)) {
      return this.memoryCache.get(cacheKey)?.data;
    }

    // Check localStorage cache
    if (this.isClient) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          
          // Check if cache is still valid
          if (this.isCacheValid(parsedCache, ttl)) {
            // Update memory cache with localStorage data
            this.memoryCache.set(cacheKey, parsedCache);
            return parsedCache.data;
          } else {
            // Cache expired, remove it
            this.clearLocalStorageCache(namespace, key);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse cache from localStorage for ${namespace}:${key}:`, error);
        this.clearLocalStorageCache(namespace, key);
      }
    }

    return null;
  }

  /**
   * Set data in both memory and localStorage cache
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {string} version - Cache version (optional)
   */
  setCachedData(namespace, key, data, version = this.defaultVersion) {
    const cacheKey = this.generateCacheKey(namespace, key);
    const timestamp = Date.now();
    const cacheData = {
      data,
      timestamp,
      version,
      namespace,
      key
    };

    // Update memory cache
    this.memoryCache.set(cacheKey, cacheData);

    // Update localStorage cache
    if (this.isClient) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn(`Failed to save cache to localStorage for ${namespace}:${key}:`, error);
      }
    }
  }

  /**
   * Check if memory cache is valid
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean}
   */
  isMemoryCacheValid(namespace, key, ttl = this.defaultTTL) {
    const cacheKey = this.generateCacheKey(namespace, key);
    const cached = this.memoryCache.get(cacheKey);
    
    return cached && 
           cached.timestamp && 
           cached.version === this.defaultVersion &&
           (Date.now() - cached.timestamp) < ttl;
  }

  /**
   * Check if cache data is valid (not expired)
   * @param {Object} cacheData - Cache data object
   * @param {number} ttl - Time to live in milliseconds
   * @returns {boolean}
   */
  isCacheValid(cacheData, ttl = this.defaultTTL) {
    if (!cacheData || !cacheData.timestamp || !cacheData.version) {
      return false;
    }

    // Check version compatibility
    if (cacheData.version !== this.defaultVersion) {
      return false;
    }

    // Check TTL
    return (Date.now() - cacheData.timestamp) < ttl;
  }

  /**
   * Clear localStorage cache for specific namespace and key
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   */
  clearLocalStorageCache(namespace, key) {
    if (this.isClient) {
      try {
        const cacheKey = this.generateCacheKey(namespace, key);
        localStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn(`Failed to clear cache from localStorage for ${namespace}:${key}:`, error);
      }
    }
  }

  /**
   * Clear all cache for a specific namespace
   * @param {string} namespace - Cache namespace
   */
  clearNamespaceCache(namespace) {
    // Clear memory cache
    const keysToDelete = [];
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.namespace === namespace) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Clear localStorage cache
    if (this.isClient) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`${namespace}_`) && key.endsWith('_cache')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn(`Failed to clear namespace cache from localStorage for ${namespace}:`, error);
      }
    }
  }

  /**
   * Clear all cache (memory + localStorage)
   */
  clearAllCache() {
    this.memoryCache.clear();
    
    if (this.isClient) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.endsWith('_cache')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear all cache from localStorage:', error);
      }
    }
  }

  /**
   * Get cached data with automatic refresh from API
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch fresh data
   * @param {Object} options - Options object
   * @param {number} options.ttl - Time to live in milliseconds
   * @param {boolean} options.forceRefresh - Force refresh from API
   * @param {Array} options.fetchArgs - Arguments to pass to fetchFunction
   * @returns {Promise<any>} Cached or fresh data
   */
  async getData(namespace, key, fetchFunction, options = {}) {
    const { ttl = this.defaultTTL, forceRefresh = false, fetchArgs = [] } = options;

    // If force refresh is requested, skip cache check
    if (!forceRefresh) {
      const cachedData = this.getCachedData(namespace, key, ttl);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // Fetch fresh data from API
      const freshData = await fetchFunction(...fetchArgs);
      this.setCachedData(namespace, key, freshData);
      return freshData;
    } catch (error) {
      console.error(`Failed to fetch data for ${namespace}:${key}:`, error);
      
      // If API fails, try to return cached data as fallback
      const fallbackData = this.getCachedData(namespace, key, ttl);
      if (fallbackData) {
        console.warn(`Using cached data for ${namespace}:${key} due to API failure`);
        return fallbackData;
      }
      
      // If no cached data available, return empty array or null
      console.warn(`No cached data available for ${namespace}:${key}, returning empty array`);
      return Array.isArray(fallbackData) ? [] : null;
    }
  }

  /**
   * Force refresh cache by fetching fresh data from API
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch fresh data
   * @param {Array} fetchArgs - Arguments to pass to fetchFunction
   * @returns {Promise<any>} Fresh data
   */
  async refreshCache(namespace, key, fetchFunction, fetchArgs = []) {
    try {
      const freshData = await fetchFunction(...fetchArgs);
      this.setCachedData(namespace, key, freshData);
      return freshData;
    } catch (error) {
      console.error(`Failed to refresh cache for ${namespace}:${key}:`, error);
      throw error;
    }
  }

  /**
   * Get cache status information for a specific namespace and key
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Object} Cache status
   */
  getCacheStatus(namespace, key, ttl = this.defaultTTL) {
    const cacheKey = this.generateCacheKey(namespace, key);
    const memoryValid = this.isMemoryCacheValid(namespace, key, ttl);
    const cachedData = this.getCachedData(namespace, key, ttl);
    const memoryCache = this.memoryCache.get(cacheKey);
    
    return {
      namespace,
      key,
      hasMemoryCache: !!memoryCache,
      hasLocalStorageCache: !!cachedData,
      isMemoryCacheValid: memoryValid,
      isLocalStorageCacheValid: !!cachedData,
      cacheAge: memoryCache?.timestamp ? Date.now() - memoryCache.timestamp : null,
      cacheVersion: memoryCache?.version || this.defaultVersion,
      cacheTTL: ttl,
      cacheKey
    };
  }

  /**
   * Get all cache statuses for a namespace
   * @param {string} namespace - Cache namespace
   * @returns {Array} Array of cache status objects
   */
  getNamespaceCacheStatus(namespace) {
    const statuses = [];
    
    // Check memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.namespace === namespace) {
        const keyParts = key.split('_');
        const cacheKey = keyParts.slice(1, -1).join('_'); // Remove namespace prefix and _cache suffix
        statuses.push(this.getCacheStatus(namespace, cacheKey));
      }
    }
    
    return statuses;
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory usage stats
   */
  getMemoryStats() {
    const stats = {
      totalEntries: this.memoryCache.size,
      namespaces: new Set(),
      totalSize: 0
    };

    for (const [key, value] of this.memoryCache.entries()) {
      stats.namespaces.add(value.namespace);
      stats.totalSize += JSON.stringify(value).length;
    }

    stats.namespaces = Array.from(stats.namespaces);
    stats.totalSizeKB = Math.round(stats.totalSize / 1024 * 100) / 100;

    return stats;
  }
}

// Create singleton instance
const storageHandler = new StorageHandler();

export default storageHandler;
