import { getProductById, getProducts, getProductByHandle } from './shopifyProducts';
import { getNavLinks } from './shopifyMenu';
import { getCollectionProductsByHandle } from './shopifyCollection';
import { cartService } from './shopifyCart';

// ---------- Public service ----------
export const shopifyService = {
  getProducts,
  getProductById,
  getProductByHandle,
  getNavLinks,
  getCollectionProductsByHandle,
  cart: cartService,
};

export default shopifyService;
