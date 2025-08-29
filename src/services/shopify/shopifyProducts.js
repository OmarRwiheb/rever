// services/shopify.js
import { apiClient } from '../axios';

const NEW_PRODUCT_DAYS = 30;
const DEFAULT_SIZE = 'ONE_SIZE';
const DEFAULT_COLOR = 'MULTI';
const DEFAULT_CURRENCY = 'USD';

// ---- Shared fragments ----
const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  createdAt
  featuredImage { url altText }
  images(first: 10) { nodes { url altText } }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  options { name values }
  variants(first: 50) {
    edges {
      cursor
      node {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) @inContext(country: EG, language: EN) {
    products(first: $first, after: $after, query: "available_for_sale:true") {
      edges {
        cursor
        node { ${PRODUCT_FIELDS} }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PRODUCT_BY_ID_QUERY = `
  query ProductById($id: ID!) @inContext(country: EG, language: EN) {
    product(id: $id) { ${PRODUCT_FIELDS} }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) @inContext(country: EG, language: EN) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;


// ---------- Helpers ----------
const lc = (s) => (s || '').toLowerCase();

const getOptionValues = (options, names) => {
  if (!Array.isArray(options)) return [];
  const namesLc = names.map(lc);
  const opt = options.find(
    (o) => o?.name && (namesLc.includes(lc(o.name)) || namesLc.some((n) => lc(o.name).includes(n)))
  );
  return Array.isArray(opt?.values) ? opt.values.filter(Boolean) : [];
};

const extractColorsFromVariants = (variantNodes) => {
  // Prefer explicit "Color" option; fallback to last segment in title ("Size / Color")
  const colorByOption = variantNodes
    .map((v) => v.selectedOptions?.find((o) => lc(o.name) === 'color')?.value)
    .filter(Boolean);
  if (colorByOption.length) return Array.from(new Set(colorByOption));

  return Array.from(
    new Set(
      variantNodes
        .map((v) => v.title)
        .filter((t) => t && t !== 'Default Title')
        .map((t) => {
          const parts = t.split(' / ');
          return parts[parts.length - 1] || t;
        })
        .filter(Boolean)
    )
  );
};

const normalizePrices = (variantNodes) => {
  // Build a normalized list of prices for quick calculations
  return variantNodes.map((v) => {
    const price = v.price?.amount ? Number(v.price.amount) : null;
    const currency = v.price?.currencyCode || DEFAULT_CURRENCY;
    const compareAt = v.compareAtPrice?.amount ? Number(v.compareAtPrice.amount) : null;
    const onSale = compareAt && price ? compareAt > price : false;
    const discountPct =
      onSale && compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
    return {
      id: v.id,
      available: !!v.availableForSale,
      price,
      compareAt,
      currency,
      onSale,
      discountPct,
    };
  });
};

const isNewProduct = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return Date.now() - created < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
};

// ---------- Transformer ----------
const transformProduct = (p) => {
  const variants = (p.variants?.edges || []).map((e) => e.node);
  const images = p.images?.nodes || [];
  const normalized = normalizePrices(variants);

  // Choose a "primary" price: min variant price among available variants if possible
  const availablePrices = normalized.filter((n) => n.available && n.price != null);
  const allPrices = normalized.filter((n) => n.price != null);
  const pool = availablePrices.length ? availablePrices : allPrices;
  const minEntry =
    pool.length ? pool.reduce((acc, cur) => (cur.price < acc.price ? cur : acc)) : null;

  const currency =
    minEntry?.currency ||
    p.priceRange?.minVariantPrice?.currencyCode ||
    DEFAULT_CURRENCY;

  const sizes =
    getOptionValues(p.options, ['size', 'sizes']).length
      ? getOptionValues(p.options, ['size', 'sizes'])
      : [DEFAULT_SIZE];

  let colors = getOptionValues(p.options, ['color', 'colors']);
  if (!colors.length) colors = extractColorsFromVariants(variants);
  const primaryColor = colors[0] || DEFAULT_COLOR;

  // Discount: pick the **largest** discount across variants to advertise "up to X%"
  const maxDiscount = normalized.reduce((m, n) => (n.discountPct > m ? n.discountPct : m), 0);
  const isSale = maxDiscount > 0;

  // Original price: use the compareAt of the minEntry if it exists, else null
  const originalPrice =
    minEntry?.onSale && minEntry.compareAt
      ? `${currency} ${minEntry.compareAt.toFixed(2)}`
      : null;

  const price =
    minEntry?.price != null
      ? `${currency} ${minEntry.price.toFixed(2)}`
      : `${currency} ${(Number(p.priceRange?.minVariantPrice?.amount) || 0).toFixed(2)}`;

  return {
    // Keep full Shopify GID (don’t parse into number; safer for APIs and links)
    id: p.id,
    slug: p.handle,
    name: p.title,
    imageUrl: p.featuredImage?.url || images[0]?.url || '/img/product-test.jpg',
    images: images.map((img) => img.url).filter(Boolean),
    price,
    originalPrice,
    isNew: isNewProduct(p.createdAt),
    isSale,
    description: p.description,
    color: (primaryColor || '').toString().toUpperCase(),
    colors: colors.map((c) => c.toString().toUpperCase()),
    reference: `REF. ${p.id.split('/').pop()}`, // still show short ref if you like
    sizes,
    modelInfo: '',
    discountPercentage: maxDiscount,
    // Useful extras your UI might want:
    availability: {
      hasAnyAvailable: variants.some((v) => v.availableForSale),
      variants: normalized.map((n) => ({ id: n.id, available: n.available })),
    },
  };
};

// ---------- Public service ----------

export async function getProducts(first = 50, after = null) {
  const data = await apiClient.graphql(PRODUCTS_QUERY, { first, after });
  console.log(data)
  const connection = data?.products;
  if (!connection?.edges) throw new Error('Invalid response from Shopify');

  const products = connection.edges.map((e) => transformProduct(e.node));
  const pageInfo = connection.pageInfo || { hasNextPage: false, endCursor: null };

  return { products, pageInfo };
}

export async function getProductById(id) {
  const data = await apiClient.graphql(PRODUCT_BY_ID_QUERY, { id });
  if (!data?.product) throw new Error('Product not found');
  return transformProduct(data.product);
}

export async function getProductByHandle(handle) {
  const data = await apiClient.graphql(PRODUCT_BY_HANDLE_QUERY, { handle });
  if (!data?.product) throw new Error('Product not found');
  return transformProduct(data.product);
}

