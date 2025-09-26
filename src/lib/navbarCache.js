// lib/navbarCache.js
import { shopifyService } from '@/services/shopify/shopify';
import storageHandler from './storageHandler';

const NAMESPACE = 'navbar';
const CACHE_KEY = 'menu';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours (half a day) in milliseconds

/**
 * Cache service for navbar menu data using the general storageHandler
 * Provides memory cache, localStorage persistence, and automatic refresh
 */
class NavbarCacheService {
  /**
   * Get navbar data with caching strategy
   * 1. Try memory cache
   * 2. Try localStorage cache
   * 3. Fetch from API and cache result
   * 4. Return cached data if API fails
   * @param {string} handle - Menu handle (default: 'main-menu')
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} Menu data
   */
  async getNavbarData(handle = 'main-menu', forceRefresh = false) {
    return await storageHandler.getData(
      NAMESPACE,
      CACHE_KEY,
      shopifyService.getNavLinks,
      {
        ttl: CACHE_TTL,
        forceRefresh,
        fetchArgs: [handle]
      }
    );
  }

  /**
   * Force refresh cache by fetching fresh data from API
   * @param {string} handle - Menu handle (default: 'main-menu')
   * @returns {Promise<Array>} Fresh menu data
   */
  async refreshCache(handle = 'main-menu') {
    return await storageHandler.refreshCache(
      NAMESPACE,
      CACHE_KEY,
      shopifyService.getNavLinks,
      [handle]
    );
  }

  /**
   * Clear navbar cache
   */
  clearCache() {
    storageHandler.clearLocalStorageCache(NAMESPACE, CACHE_KEY);
  }

  /**
   * Clear all navbar cache (memory + localStorage)
   */
  clearAllCache() {
    storageHandler.clearNamespaceCache(NAMESPACE);
  }

  /**
   * Get cache status information
   * @returns {Object} Cache status
   */
  getCacheStatus() {
    return storageHandler.getCacheStatus(NAMESPACE, CACHE_KEY, CACHE_TTL);
  }

  /**
   * Get cached data without fetching from API
   * @returns {Array|null} Cached data or null if not available/expired
   */
  getCachedData() {
    return storageHandler.getCachedData(NAMESPACE, CACHE_KEY, CACHE_TTL);
  }
}

// Create singleton instance
const navbarCacheService = new NavbarCacheService();

export default navbarCacheService;
