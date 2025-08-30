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

      const response = await apiClient.graphql(CUSTOMER_QUERY, variables);
      
      if (response?.customer) {
        return {
          success: true,
          customer: response.customer
        };
      }

      return {
        success: false,
        message: 'Failed to retrieve customer data'
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
  }
};
