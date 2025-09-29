import { apiClient } from '../axios';

// GraphQL Mutations and Queries
const CREATE_CART_MUTATION = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        note
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { subtotalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    title
                    handle
                    featuredImage { url altText }
                  }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        note
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { subtotalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    title
                    handle
                    featuredImage { url altText }
                  }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_CART_LINE_MUTATION = `
  mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        note
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { subtotalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    title
                    handle
                    featuredImage { url altText }
                  }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        note
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { subtotalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    title
                    handle
                    featuredImage { url altText }
                  }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        note
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              cost { subtotalAmount { amount currencyCode } }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    id
                    title
                    handle
                    featuredImage { url altText }
                  }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_NOTE_UPDATE_MUTATION = `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart { 
        id 
        note 
      }
      userErrors { field message }
      warnings { code message }
    }
  }
`;

const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      note
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
        totalTaxAmount { amount currencyCode }
      }
      lines(first: 250) {
        edges {
          node {
            id
            quantity
            cost { subtotalAmount { amount currencyCode } }
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                product {
                  id
                  title
                  handle
                  featuredImage { url altText }
                }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

// Helper functions
function toVariantGID(id) {
  if (!id) throw new Error('Invalid variant ID');
  const s = String(id);
  
  if (s.startsWith('gid://shopify/ProductVariant/')) {
    return s;
  }
  
  if (/^\d+$/.test(s)) {
    return `gid://shopify/ProductVariant/${s}`;
  }
  
  throw new Error('Invalid variant ID format. Expected numeric ID or GID format');
}

function formatPrice(amount, currencyCode, locale = 'en-EG') {
  if (amount == null || !currencyCode) return '';
  const n = Number(amount);
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(n);
}

// Transform cart data to a more usable format
function transformCart(cartData) {
  if (!cartData) return null;

  const transformedCart = {
    id: cartData.id,
    checkoutUrl: cartData.checkoutUrl,
    totalQuantity: cartData.totalQuantity || 0,
    subtotal: formatPrice(
      cartData.cost?.subtotalAmount?.amount,
      cartData.cost?.subtotalAmount?.currencyCode
    ),
    total: formatPrice(
      cartData.cost?.totalAmount?.amount,
      cartData.cost?.totalAmount?.currencyCode
    ),
    tax: formatPrice(
      cartData.cost?.totalTaxAmount?.amount,
      cartData.cost?.totalTaxAmount?.currencyCode
    ),
    items: cartData.lines?.edges?.map(edge => {
      const line = edge.node;
      const variant = line.merchandise;
      
      return {
        id: line.id,
        quantity: line.quantity,
        variantId: variant.id,
        title: variant.title,
        price: formatPrice(
          variant.price?.amount,
          variant.price?.currencyCode
        ),
        rawPrice: variant.price?.amount,
        rawCurrency: variant.price?.currencyCode,
        subtotal: formatPrice(
          line.cost?.subtotalAmount?.amount,
          line.cost?.subtotalAmount?.currencyCode
        ),
        product: {
          id: variant.product.id,
          title: variant.product.title,
          handle: variant.product.handle,
          image: variant.product.featuredImage?.url,
          imageAlt: variant.product.featuredImage?.altText,
        },
        options: variant.selectedOptions?.map(opt => ({
          name: opt.name,
          value: opt.value,
        })) || [],
      };
    }) || [],
  };

  // Calculate totals manually if Shopify doesn't provide them
  if (!transformedCart.subtotal || !transformedCart.total) {
    let calculatedSubtotal = 0;
    let currency = 'USD';
    
    transformedCart.items.forEach(item => {
      if (item.rawPrice && item.rawCurrency) {
        const numericPrice = parseFloat(item.rawPrice);
        if (!isNaN(numericPrice)) {
          calculatedSubtotal += numericPrice * item.quantity;
          currency = item.rawCurrency;
        }
      }
    });
    
    if (calculatedSubtotal > 0) {
      transformedCart.subtotal = formatPrice(calculatedSubtotal, currency);
      transformedCart.total = transformedCart.subtotal;
    }
  }

  return transformedCart;
}

class CartService {
  constructor() {
    this.cartId = this.getCartIdFromStorage();
    this._createInFlight = null;
  }

  getCartIdFromStorage() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('shopify_cart_id');
  }

  saveCartIdToStorage(cartId) {
    if (typeof window === 'undefined') return;
    if (cartId) localStorage.setItem('shopify_cart_id', cartId);
    else localStorage.removeItem('shopify_cart_id');
  }

  async ensureCart() {
    if (this.cartId) return this.cartId;
    if (!this._createInFlight) {
      this._createInFlight = this.createCart()
        .then(() => this.cartId)
        .finally(() => { this._createInFlight = null; });
    }
    const id = await this._createInFlight;
    if (!id) throw new Error('Failed to ensure cart');
    return id;
  }

  async createCart() {
    const res = await apiClient.graphql(CREATE_CART_MUTATION, {
      input: {},
    });

    const errs = res?.cartCreate?.userErrors || [];
    if (errs.length) throw new Error(errs.map(e => e.message).join(' | '));

    const cart = res?.cartCreate?.cart;
    if (!cart) throw new Error('Failed to create cart');

    this.cartId = cart.id;
    this.saveCartIdToStorage(cart.id);
    return transformCart(cart);
  }

  async getCart() {
    if (!this.cartId) return null;
    
    try {
      const res = await apiClient.graphql(GET_CART_QUERY, { cartId: this.cartId });
      const cart = res?.cart;
      
      if (!cart) {
        this.cartId = null;
        this.saveCartIdToStorage(null);
        return null;
      }
      
      return transformCart(cart);
    } catch (e) {
      console.error('Error in getCart:', e);
      this.cartId = null;
      this.saveCartIdToStorage(null);
      return null;
    }
  }

  async addToCart(variantId, quantity = 1, customAttributes = []) {
    const merchandiseId = toVariantGID(variantId);
    await this.ensureCart();

    const lines = [{
      merchandiseId,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
    }];

    // Note: customAttributes are not supported in the basic CartLineInput
    // They need to be handled differently in Shopify
    if (customAttributes && customAttributes.length > 0) {
      console.log('Custom attributes provided but not supported in basic mutation:', customAttributes);
    }

    const res = await apiClient.graphql(ADD_TO_CART_MUTATION, {
      cartId: this.cartId,
      lines,
    });

    const errs = res?.cartLinesAdd?.userErrors || [];
    if (errs.length) throw new Error(errs.map(e => e.message).join(' | '));

    const cart = res?.cartLinesAdd?.cart;
    if (!cart) throw new Error('Failed to add item to cart');
    return transformCart(cart);
  }

  async addOrUpdate(variantId, deltaQty = 1, customAttributes = []) {
    const merchandiseId = toVariantGID(variantId);
    await this.ensureCart();

    const current = await this.getCart();
    
    // For now, we'll just check if the variant exists (without custom attributes)
    // In a full implementation, you'd need to handle custom attributes differently
    const existing = current?.items.find(i => i.variantId === merchandiseId);

    if (existing) {
      const newQuantity = existing.quantity + (parseInt(deltaQty, 10) || 1);
      if (newQuantity <= 0) {
        return this.removeFromCart(existing.id);
      }
      return this.updateCartLine(existing.id, newQuantity);
    }
    return this.addToCart(variantId, deltaQty, customAttributes);
  }

  async updateCartLine(lineId, quantity) {
    if (!this.cartId) throw new Error('No cart found');
    if (!lineId) throw new Error('Invalid line id');

    if (quantity <= 0) {
      return this.removeFromCart(lineId);
    }

    const res = await apiClient.graphql(UPDATE_CART_LINE_MUTATION, {
      cartId: this.cartId,
      lines: [{ id: lineId, quantity }],
    });

    const errs = res?.cartLinesUpdate?.userErrors || [];
    if (errs.length) throw new Error(errs.map(e => e.message).join(' | '));

    const cart = res?.cartLinesUpdate?.cart;
    if (!cart) throw new Error('Failed to update cart line');
    return transformCart(cart);
  }

  async removeFromCart(lineId) {
    if (!this.cartId) throw new Error('No cart found');
    const res = await apiClient.graphql(REMOVE_FROM_CART_MUTATION, {
      cartId: this.cartId,
      lineIds: [lineId],
    });
    const errs = res?.cartLinesRemove?.userErrors || [];
    if (errs.length) throw new Error(errs.map(e => e.message).join(' | '));

    const cart = res?.cartLinesRemove?.cart;
    if (!cart) throw new Error('Failed to remove item from cart');
    
    const transformedCart = transformCart(cart);
    
    // If the cart is now empty, clear the cart ID
    if (transformedCart && transformedCart.items.length === 0) {
      this.cartId = null;
      this.saveCartIdToStorage(null);
      return null;
    }
    
    return transformedCart;
  }

  // Change variant for a cart line
  async changeVariant(lineId, newVariantId, quantity = 1) {
    try {
      // First remove the old line
      await this.removeFromCart(lineId);
      
      // Then add the new variant
      return await this.addToCart(newVariantId, quantity);
    } catch (error) {
      console.error('Failed to change variant:', error);
      throw error;
    }
  }

  // Get available variants for a product (for variant selection)
  async getProductVariants(productId) {
    try {
      const query = `
        query ProductVariants($id: ID!) @inContext(country: EG, language: EN) {
          product(id: $id) {
            variants(first: 50) {
              edges {
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
          }
        }
      `;
      
      const data = await apiClient.graphql(query, { id: productId });
      return data?.product?.variants?.edges?.map(e => e.node) || [];
    } catch (error) {
      console.error('Failed to get product variants:', error);
      throw error;
    }
  }

  async clearCart() {
    if (!this.cartId) return null;
    const cart = await this.getCart();
    if (!cart || cart.items.length === 0) return null;

    const res = await apiClient.graphql(REMOVE_FROM_CART_MUTATION, {
      cartId: this.cartId,
      lineIds: cart.items.map(i => i.id),
    });
    const errs = res?.cartLinesRemove?.userErrors || [];
    if (errs.length) throw new Error(errs.map(e => e.message).join(' | '));

    // Clear the cart ID since we're clearing the cart
    this.cartId = null;
    this.saveCartIdToStorage(null);
    
    return null;
  }

  getCartId() { return this.cartId; }
  hasCart() { return !!this.cartId; }

  // Get checkout URL with customer info if logged in
  async getCustomerCheckoutUrl(customerAccessToken = null) {
    if (!this.cartId) return null;
    
    if (!customerAccessToken) return null;
    
    try {
      // Get the current cart data to access checkoutUrl
      const cart = await this.getCart();
      if (!cart) return null;
      
      let checkoutUrl = cart.checkoutUrl;
      
      if (checkoutUrl) {
        // Add customer access token to checkout URL for pre-filled customer data
        const separator = checkoutUrl.includes('?') ? '&' : '?';
        checkoutUrl += `${separator}customer_access_token=${customerAccessToken}`;
        return checkoutUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get customer checkout URL:', error);
      return null;
    }
  }

  // Get checkout URL with automatic customer token detection
  async getCheckoutUrl() {
    if (!this.cartId) return null;
    
    try {
      // Get the current cart data to access checkoutUrl
      const cart = await this.getCart();
      if (!cart) return null;
      
      // Try to get customer access token from storage
      try {
        const token = localStorage.getItem('shopify_customer_token') || sessionStorage.getItem('shopify_customer_token');
        
        if (token) {
          // User is logged in, use authenticated checkout
          const customerUrl = await this.getCustomerCheckoutUrl(token);
          return customerUrl;
        } else {
          // User is not logged in, use regular unauthenticated checkout
          return cart.checkoutUrl || null;
        }
      } catch (error) {
        // Fall back to regular checkout if token retrieval fails
        return cart.checkoutUrl || null;
      }
    } catch (error) {
      console.error('Failed to get checkout URL:', error);
      return null;
    }
  }

  // Update cart buyer identity to associate cart with customer
  async updateCartBuyerIdentity(customerAccessToken) {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    if (!customerAccessToken) {
      throw new Error('Customer access token is required');
    }

    try {
      const res = await apiClient.graphql(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
        cartId: this.cartId,
        buyerIdentity: {
          customerAccessToken: customerAccessToken
        }
      });

      const errs = res?.cartBuyerIdentityUpdate?.userErrors || [];
      if (errs.length) {
        throw new Error(errs.map(e => e.message).join(' | '));
      }

      const cart = res?.cartBuyerIdentityUpdate?.cart;
      if (!cart) {
        throw new Error('Failed to update cart buyer identity');
      }

      return transformCart(cart);
    } catch (error) {
      console.error('Failed to update cart buyer identity:', error);
      throw error;
    }
  }

  // Update cart note
  async updateCartNote(note) {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    try {
      const res = await apiClient.graphql(CART_NOTE_UPDATE_MUTATION, {
        cartId: this.cartId,
        note: note || ''
      });

      const errs = res?.cartNoteUpdate?.userErrors || [];
      if (errs.length) {
        throw new Error(errs.map(e => e.message).join(' | '));
      }

      const cart = res?.cartNoteUpdate?.cart;
      if (!cart) {
        throw new Error('Failed to update cart note');
      }

      // Update the cart in storage with the new note
      const updatedCart = await this.getCart();
      return updatedCart;
    } catch (error) {
      console.error('Failed to update cart note:', error);
      throw error;
    }
  }

}

// Export singleton instance
export const cartService = new CartService();
export default cartService;
