import { apiClient } from '../axios';

// GraphQL mutations for address management
const CUSTOMER_ADDRESSES_QUERY = `
  query getCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            company
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
      defaultAddress {
        id
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const shopifyAddressService = {
  /**
   * Get customer addresses
   * @param {string} customerAccessToken - Customer access token
   * @returns {Promise<Object>} - Addresses data
   */
  async getCustomerAddresses(customerAccessToken) {
    try {
      const response = await apiClient.graphql(CUSTOMER_ADDRESSES_QUERY, {
        customerAccessToken
      });

      // Handle both response structures
      const customer = response?.data?.customer || response?.customer;
      
      if (customer) {
        const addresses = customer.addresses.edges.map(edge => edge.node);
        return {
          success: true,
          addresses: addresses,
          defaultAddress: customer.defaultAddress
        };
      }

      return {
        success: false,
        message: 'Failed to retrieve addresses',
        response: response
      };

    } catch (error) {
      console.error('Error getting customer addresses:', error);
      return {
        success: false,
        message: 'An error occurred while retrieving addresses',
        error: error.message
      };
    }
  },

  /**
   * Create a new customer address
   * @param {string} customerAccessToken - Customer access token
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} - Creation result
   */
  async createCustomerAddress(customerAccessToken, addressData) {
    try {
      const response = await apiClient.graphql(CUSTOMER_ADDRESS_CREATE_MUTATION, {
        customerAccessToken,
        address: addressData
      });

      // Check for success in both possible response structures
      const customerAddress = response?.data?.customerAddressCreate?.customerAddress || response?.customerAddressCreate?.customerAddress;
      const errors = response?.data?.customerAddressCreate?.customerUserErrors || response?.customerAddressCreate?.customerUserErrors || [];

      if (customerAddress) {
        return {
          success: true,
          address: customerAddress
        };
      }
      return {
        success: false,
        message: errors.length > 0 ? errors[0].message : 'Failed to create address',
        errors: errors
      };

    } catch (error) {
      console.error('Error creating customer address:', error);
      return {
        success: false,
        message: 'An error occurred while creating address',
        error: error.message
      };
    }
  },

  /**
   * Update an existing customer address
   * @param {string} customerAccessToken - Customer access token
   * @param {string} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise<Object>} - Update result
   */
  async updateCustomerAddress(customerAccessToken, addressId, addressData) {
    try {
      const response = await apiClient.graphql(CUSTOMER_ADDRESS_UPDATE_MUTATION, {
        customerAccessToken,
        id: addressId,
        address: addressData
      });

      // Handle both response structures
      const customerAddress = response?.data?.customerAddressUpdate?.customerAddress || response?.customerAddressUpdate?.customerAddress;
      const errors = response?.data?.customerAddressUpdate?.customerUserErrors || response?.customerAddressUpdate?.customerUserErrors || [];

      if (customerAddress) {
        return {
          success: true,
          address: customerAddress
        };
      }
      return {
        success: false,
        message: errors.length > 0 ? errors[0].message : 'Failed to update address',
        errors: errors
      };

    } catch (error) {
      console.error('Error updating customer address:', error);
      return {
        success: false,
        message: 'An error occurred while updating address',
        error: error.message
      };
    }
  },

  /**
   * Delete a customer address
   * @param {string} customerAccessToken - Customer access token
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteCustomerAddress(customerAccessToken, addressId) {
    try {
      const response = await apiClient.graphql(CUSTOMER_ADDRESS_DELETE_MUTATION, {
        customerAccessToken,
        id: addressId
      });

      // Handle both response structures
      const deletedId = response?.data?.customerAddressDelete?.deletedCustomerAddressId || response?.customerAddressDelete?.deletedCustomerAddressId;
      const errors = response?.data?.customerAddressDelete?.customerUserErrors || response?.customerAddressDelete?.customerUserErrors || [];

      if (deletedId) {
        return {
          success: true,
          deletedAddressId: deletedId
        };
      }
      return {
        success: false,
        message: errors.length > 0 ? errors[0].message : 'Failed to delete address',
        errors: errors
      };

    } catch (error) {
      console.error('Error deleting customer address:', error);
      return {
        success: false,
        message: 'An error occurred while deleting address',
        error: error.message
      };
    }
  },

  /**
   * Set default customer address
   * @param {string} customerAccessToken - Customer access token
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - Update result
   */
  async setDefaultAddress(customerAccessToken, addressId) {
    try {
      const response = await apiClient.graphql(CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION, {
        customerAccessToken,
        addressId
      });

      // Handle both response structures
      const customer = response?.data?.customerDefaultAddressUpdate?.customer || response?.customerDefaultAddressUpdate?.customer;
      const errors = response?.data?.customerDefaultAddressUpdate?.customerUserErrors || response?.customerDefaultAddressUpdate?.customerUserErrors || [];

      if (customer) {
        return {
          success: true,
          defaultAddress: customer.defaultAddress
        };
      }
      return {
        success: false,
        message: errors.length > 0 ? errors[0].message : 'Failed to set default address',
        errors: errors
      };

    } catch (error) {
      console.error('Error setting default address:', error);
      return {
        success: false,
        message: 'An error occurred while setting default address',
        error: error.message
      };
    }
  },

  /**
   * Validate address data
   * @param {Object} addressData - Address data to validate
   * @returns {Object} - Validation result
   */
  validateAddressData(addressData) {
    const errors = [];

    if (!addressData.firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!addressData.lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (!addressData.address1?.trim()) {
      errors.push({ field: 'address1', message: 'Address line 1 is required' });
    }

    if (!addressData.city?.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    }

    if (!addressData.province?.trim()) {
      errors.push({ field: 'province', message: 'State/Province is required' });
    }

    if (!addressData.zip?.trim()) {
      errors.push({ field: 'zip', message: 'ZIP/Postal code is required' });
    }

    if (!addressData.country?.trim()) {
      errors.push({ field: 'country', message: 'Country is required' });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

// Export individual functions for easier importing
export const getCustomerAddresses = (token) => shopifyAddressService.getCustomerAddresses(token);
export const createCustomerAddress = (token, data) => shopifyAddressService.createCustomerAddress(token, data);
export const updateCustomerAddress = (token, id, data) => shopifyAddressService.updateCustomerAddress(token, id, data);
export const deleteCustomerAddress = (token, id) => shopifyAddressService.deleteCustomerAddress(token, id);
export const setDefaultAddress = (token, id) => shopifyAddressService.setDefaultAddress(token, id);
export const validateAddressData = (data) => shopifyAddressService.validateAddressData(data);
