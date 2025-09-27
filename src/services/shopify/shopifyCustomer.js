import { apiClient } from '../axios';

// GraphQL mutation for customer creation
const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
        createdAt
        updatedAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation for customer access token creation (login)
const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation for updating customer wishlist metafield using MetafieldsSet
const METAFIELDS_SET_MUTATION = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
        value
        type
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

// GraphQL mutation for updating customer wishlist metafield (legacy)
const CUSTOMER_WISHLIST_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        metafield(key: "wishlist", namespace: "custom") {
          id
          key
          namespace
          value
          type
          createdAt
          updatedAt
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation for customer password reset request
const CUSTOMER_RECOVER_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation for customer password reset
const CUSTOMER_RESET_MUTATION = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation for updating customer profile (Storefront API)
const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

// GraphQL query to get customer data
const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
      createdAt
      updatedAt
      metafield(key: "wishlist", namespace: "custom") {
        id
        key
        namespace
        value
        type
        createdAt
        updatedAt
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            phone
          }
        }
      }
      orders(first: 10) {
        edges {
          node {
            id
            name
            fulfillmentStatus
            financialStatus
            totalPrice {
              amount
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            processedAt
          }
        }
      }
    }
  }
`;

export const shopifyCustomerService = {
  /**
   * Create a new customer account
   * @param {Object} customerData - Customer registration data
   * @param {string} customerData.firstName - Customer's first name
   * @param {string} customerData.lastName - Customer's last name
   * @param {string} customerData.email - Customer's email address
   * @param {string} customerData.password - Customer's password
   * @param {string} [customerData.phone] - Customer's phone number (optional)
   * @param {boolean} [customerData.acceptsMarketing] - Whether customer accepts marketing emails
   * @returns {Promise<Object>} - Customer creation result
   */
  async createCustomer(customerData) {
    try {
      const variables = {
        input: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          password: customerData.password,
          acceptsMarketing: customerData.acceptsMarketing || false,
        }
      };

      // Add phone if provided
      if (customerData.phone) {
        variables.input.phone = customerData.phone;
      }

      const response = await apiClient.graphql(CUSTOMER_CREATE_MUTATION, variables);
      
      if (response?.customerCreate?.customerUserErrors?.length > 0) {
        const errors = response.customerCreate.customerUserErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Customer creation failed'
        };
      }

      const customer = response?.customerCreate?.customer;
      if (customer) {
        return {
          success: true,
          customer: customer,
          message: 'Customer created successfully'
        };
      }

      return {
        success: false,
        message: 'Customer creation failed - no customer data returned'
      };

    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Check if this is a GraphQL error response (not a network error)
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Customer creation failed'
        };
      }
      
      // For actual network/connection errors
      return {
        success: false,
        message: 'An error occurred while creating the customer account',
        error: error.message
      };
    }
  },

  /**
   * Create customer access token (login)
   * @param {string} email - Customer's email address
   * @param {string} password - Customer's password
   * @returns {Promise<Object>} - Login result with access token
   */
  async createCustomerAccessToken(email, password) {
    try {
      const variables = {
        input: {
          email: email,
          password: password
        }
      };

      const response = await apiClient.graphql(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, variables);
      
      if (response?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
        const errors = response.customerAccessTokenCreate.customerUserErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Login failed'
        };
      }

      const accessToken = response?.customerAccessTokenCreate?.customerAccessToken;
      if (accessToken) {
        return {
          success: true,
          accessToken: accessToken,
          message: 'Login successful'
        };
      }

      return {
        success: false,
        message: 'Login failed - no access token returned'
      };

    } catch (error) {
      console.error('Error creating customer access token:', error);
      return {
        success: false,
        message: 'An error occurred during login',
        error: error.message
      };
    }
  },

  /**
   * Get customer data using access token
   * @param {string} accessToken - Customer access token
   * @returns {Promise<Object>} - Customer data
   */
  async getCustomer(accessToken) {
    try {
      const variables = {
        customerAccessToken: accessToken
      };

      console.log('getCustomer - variables:', variables);
      console.log('getCustomer - CUSTOMER_QUERY:', CUSTOMER_QUERY);

      const response = await apiClient.graphql(CUSTOMER_QUERY, variables);
      
      console.log('getCustomer - response:', response);
      
      if (response?.customer) {
        console.log('getCustomer - customer found:', response.customer);
        return {
          success: true,
          customer: response.customer
        };
      }

      console.log('getCustomer - no customer in response');
      return {
        success: false,
        message: 'Failed to retrieve customer data',
        response: response
      };

    } catch (error) {
      console.error('Error getting customer:', error);
      return {
        success: false,
        message: 'An error occurred while retrieving customer data',
        error: error.message
      };
    }
  },

  /**
   * Validate customer data before submission
   * @param {Object} customerData - Customer data to validate
   * @returns {Object} - Validation result
   */
  validateCustomerData(customerData) {
    const errors = [];

    if (!customerData.firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!customerData.lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (!customerData.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!customerData.password?.trim()) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (customerData.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    }

    if (customerData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(customerData.phone.replace(/\s/g, ''))) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Get customer wishlist from metafield
   * @param {Object} customer - Customer object with metafield
   * @returns {Array} - Array of product IDs
   */
  getWishlistFromCustomer(customer) {
    try {
      if (customer?.metafield?.value) {
        return JSON.parse(customer.metafield.value);
      }
      return [];
    } catch (error) {
      console.error('Error parsing wishlist:', error);
      return [];
    }
  },

  /**
   * Update customer wishlist metafield using MetafieldsSet mutation
   * @param {string} customerId - Customer ID (GID format)
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise<Object>} - Update result
   */
  async updateCustomerWishlist(customerId, productIds) {
    try {
      // Ensure customerId is in GID format
      const customerGid = customerId.startsWith('gid://') ? customerId : `gid://shopify/Customer/${customerId}`;
      
      // Convert product IDs to GID format
      const productGids = productIds.map(id => 
        id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
      );

      const variables = {
        metafields: [
          {
            ownerId: customerGid,
            namespace: "custom",
            key: "wishlist",
            type: "list.product_reference",
            value: JSON.stringify(productGids)
          }
        ]
      };

      const response = await apiClient.adminGraphql(METAFIELDS_SET_MUTATION, variables);
      
      if (response?.metafieldsSet?.userErrors?.length > 0) {
        const errors = response.metafieldsSet.userErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Failed to update wishlist'
        };
      }

      return {
        success: true,
        wishlist: productIds, // Return the original product IDs
        message: 'Wishlist updated successfully'
      };

    } catch (error) {
      console.error('Error updating wishlist:', error);
      return {
        success: false,
        message: 'An error occurred while updating wishlist',
        error: error.message
      };
    }
  },

  /**
   * Add product to customer wishlist
   * @param {string} customerId - Customer ID
   * @param {string} productId - Product ID to add
   * @param {Array} currentWishlist - Current wishlist array
   * @returns {Promise<Object>} - Update result
   */
  async addToWishlist(customerId, productId, currentWishlist = []) {
    if (currentWishlist.includes(productId)) {
      return {
        success: true,
        message: 'Product already in wishlist',
        wishlist: currentWishlist
      };
    }

    const updatedWishlist = [...currentWishlist, productId];
    return await this.updateCustomerWishlist(customerId, updatedWishlist);
  },

  /**
   * Remove product from customer wishlist
   * @param {string} customerId - Customer ID
   * @param {string} productId - Product ID to remove
   * @param {Array} currentWishlist - Current wishlist array
   * @returns {Promise<Object>} - Update result
   */
  async removeFromWishlist(customerId, productId, currentWishlist = []) {
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    return await this.updateCustomerWishlist(customerId, updatedWishlist);
  },

  /**
   * Request password reset for a customer
   * @param {string} email - Customer's email address
   * @returns {Promise<Object>} - Password reset request result
   */
  async requestPasswordReset(email) {
    try {
      const variables = {
        email: email
      };

      const response = await apiClient.graphql(CUSTOMER_RECOVER_MUTATION, variables);
      
      if (response?.customerRecover?.customerUserErrors?.length > 0) {
        const errors = response.customerRecover.customerUserErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Password reset request failed'
        };
      }

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email address'
      };

    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        message: 'An error occurred while requesting password reset',
        error: error.message
      };
    }
  },

  /**
   * Reset customer password using reset URL
   * @param {string} resetUrl - Password reset URL from email
   * @param {string} password - New password
   * @returns {Promise<Object>} - Password reset result
   */
  async resetPassword(resetUrl, password) {
    try {
      const variables = {
        resetUrl: resetUrl,
        password: password
      };

      const response = await apiClient.graphql(CUSTOMER_RESET_MUTATION, variables);
      
      if (response?.customerResetByUrl?.customerUserErrors?.length > 0) {
        const errors = response.customerResetByUrl.customerUserErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Password reset failed'
        };
      }

      const customer = response?.customerResetByUrl?.customer;
      const accessToken = response?.customerResetByUrl?.customerAccessToken;

      if (customer && accessToken) {
        return {
          success: true,
          customer: customer,
          accessToken: accessToken,
          message: 'Password reset successfully'
        };
      }

      return {
        success: false,
        message: 'Password reset failed - no customer data returned'
      };

    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'An error occurred while resetting password',
        error: error.message
      };
    }
  },

  /**
   * Update customer profile information
   * @param {string} accessToken - Customer access token
   * @param {Object} customerData - Customer data to update
   * @param {string} [customerData.firstName] - Customer's first name
   * @param {string} [customerData.lastName] - Customer's last name
   * @param {string} [customerData.email] - Customer's email address
   * @param {string} [customerData.phone] - Customer's phone number
   * @param {boolean} [customerData.acceptsMarketing] - Whether customer accepts marketing emails
   * @returns {Promise<Object>} - Customer update result
   */
  async updateCustomer(accessToken, customerData) {
    try {
      const variables = {
        customerAccessToken: accessToken,
        customer: {}
      };

      // Only include fields that are provided
      if (customerData.firstName !== undefined) {
        variables.customer.firstName = customerData.firstName;
      }
      if (customerData.lastName !== undefined) {
        variables.customer.lastName = customerData.lastName;
      }
      if (customerData.email !== undefined) {
        variables.customer.email = customerData.email;
      }
      if (customerData.phone !== undefined) {
        variables.customer.phone = customerData.phone;
      }
      if (customerData.acceptsMarketing !== undefined) {
        variables.customer.acceptsMarketing = customerData.acceptsMarketing;
      }

      const response = await apiClient.graphql(CUSTOMER_UPDATE_MUTATION, variables);
      
      if (response?.customerUpdate?.customerUserErrors?.length > 0) {
        const errors = response.customerUpdate.customerUserErrors;
        return {
          success: false,
          errors: errors,
          message: errors[0]?.message || 'Customer update failed'
        };
      }

      const updatedCustomer = response?.customerUpdate?.customer;
      if (updatedCustomer) {
        return {
          success: true,
          customer: updatedCustomer,
          message: 'Customer updated successfully'
        };
      }

      return {
        success: false,
        message: 'Customer update failed - no customer data returned'
      };

    } catch (error) {
      console.error('Error updating customer:', error);
      return {
        success: false,
        message: 'An error occurred while updating customer profile',
        error: error.message
      };
    }
  },

  /**
   * Generate a random password for newsletter subscribers
   * @returns {string} - Random password
   */
  generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  /**
   * Subscribe email to newsletter (creates customer or updates existing customer)
   * @param {string} email - Email address to subscribe
   * @returns {Promise<Object>} - Newsletter subscription result
   */
  async subscribeToNewsletter(email) {
    try {
      // First, try to create a new customer
      const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const customerData = {
        firstName: 'Newsletter',
        lastName: 'Subscriber',
        email: email,
        password: generatePassword(),
        acceptsMarketing: true
      };

      const result = await this.createCustomer(customerData);
      
      // If customer creation was successful, return the result
      if (result.success) {
        return result;
      }

      // Handle different types of errors
      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        
        // If customer already exists (TAKEN error)
        if (error.code === 'TAKEN') {
          return {
            success: false,
            message: 'This email is already registered. Please log in to your account to update your newsletter preferences.',
            alreadyExists: true,
            customer: {
              email: email
            }
          };
        }
        
        // If rate limited
        if (error.code === 'THROTTLED') {
          return {
            success: false,
            message: 'Too many requests. Please try again in a few minutes.',
            rateLimited: true
          };
        }
        
        // For other errors, return the original result
        return result;
      }

      // If no specific errors but still failed, return the result
      return result;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        message: 'An error occurred while subscribing to newsletter',
        error: error.message
      };
    }
  }
};

// Export individual functions for easier importing
export const createCustomer = shopifyCustomerService.createCustomer;
export const createCustomerAccessToken = shopifyCustomerService.createCustomerAccessToken;
export const getCustomer = shopifyCustomerService.getCustomer;
export const updateCustomer = shopifyCustomerService.updateCustomer;
export const validateCustomerData = shopifyCustomerService.validateCustomerData;
export const subscribeToNewsletter = shopifyCustomerService.subscribeToNewsletter;
export const getWishlistFromCustomer = shopifyCustomerService.getWishlistFromCustomer;
export const updateCustomerWishlist = shopifyCustomerService.updateCustomerWishlist;
export const addToWishlist = shopifyCustomerService.addToWishlist;
export const removeFromWishlist = shopifyCustomerService.removeFromWishlist;
export const requestPasswordReset = shopifyCustomerService.requestPasswordReset;
export const resetPassword = shopifyCustomerService.resetPassword;
