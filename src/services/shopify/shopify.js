import { getProductById, getProducts, getProductByHandle } from './shopifyProducts';
import { getNavLinks } from './shopifyMenu';
import { getCollectionProductsByHandle } from './shopifyCollection';
import { cartService } from './shopifyCart';
import { getLookbooks, getLookbookByHandle } from './shopifyLookbook';

// ---------- Public service ----------
export const shopifyService = {
  getProducts,
  getProductById,
  getProductByHandle,
  getNavLinks,
  getCollectionProductsByHandle,
  getLookbooks,
  getLookbookByHandle,
  cart: cartService,
};

export default shopifyService;
