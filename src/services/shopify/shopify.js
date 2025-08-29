import { getProductById, getProducts } from './shopifyProducts';
import { getNavLinks } from './shopifyMenu';
import { getCollectionProductsByHandle } from './shopifyCollection';

// ---------- Public service ----------
export const shopifyService = {
  getProducts,
  getProductById,
  getNavLinks,
  getCollectionProductsByHandle,
};

export default shopifyService;
