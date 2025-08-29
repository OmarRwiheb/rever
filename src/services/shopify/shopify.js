import { getProductById, getProducts, getProductByHandle } from './shopifyProducts';
import { getNavLinks } from './shopifyMenu';
import { getCollectionProductsByHandle } from './shopifyCollection';

// ---------- Public service ----------
export const shopifyService = {
  getProducts,
  getProductById,
  getProductByHandle,
  getNavLinks,
  getCollectionProductsByHandle,
};

export default shopifyService;
