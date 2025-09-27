import { getProductById, getProducts, getProductByHandle } from './shopifyProducts';
import { getNavLinks } from './shopifyMenu';
import { getCollectionProductsByHandle } from './shopifyCollection';
import { cartService } from './shopifyCart';
import { getLookbooks, getLookbookByHandle } from './shopifyLookbook';
import { getArticles, getArticleByHandle, getArticleById, getBlogArticles, getRelatedArticles } from './shopifyBlog';
import { 
  createCustomer, 
  createCustomerAccessToken, 
  getCustomer, 
  validateCustomerData,
  subscribeToNewsletter,
  getWishlistFromCustomer,
  updateCustomerWishlist,
  addToWishlist,
  removeFromWishlist
} from './shopifyCustomer';

// ---------- Public service ----------
export const shopifyService = {
  getProducts,
  getProductById,
  getProductByHandle,
  getNavLinks,
  getCollectionProductsByHandle,
  getLookbooks,
  getLookbookByHandle,
  getArticles,
  getArticleByHandle,
  getArticleById,
  getBlogArticles,
  getRelatedArticles,
  cart: cartService,
  // Customer functions
  createCustomer,
  createCustomerAccessToken,
  getCustomer,
  validateCustomerData,
  subscribeToNewsletter,
  // Wishlist functions
  getWishlistFromCustomer,
  updateCustomerWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default shopifyService;
