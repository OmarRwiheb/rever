import { apiClient } from '../axios';

// GraphQL query to get available countries
const COUNTRIES_QUERY = `
  query CountriesFromMarkets {
    localization {
      availableCountries {
        isoCode
        name
        availableLanguages {
          isoCode
        }
      }
    }
  }
`;

export const shopifyCountriesService = {
  /**
   * Get available countries from Shopify
   * @returns {Promise<Object>} - Countries data
   */
  async getCountries() {
    try {
      const response = await apiClient.graphql(COUNTRIES_QUERY);
      
      // Handle both response structures (with and without data wrapper)
      const countries = response?.data?.localization?.availableCountries || response?.localization?.availableCountries;
      
      if (countries && countries.length > 0) {
        return {
          success: true,
          countries: countries
        };
      }

      return {
        success: false,
        message: 'Failed to retrieve countries',
        response: response
      };

    } catch (error) {
      console.error('Error getting countries:', error);
      return {
        success: false,
        message: 'An error occurred while retrieving countries',
        error: error.message
      };
    }
  },

  /**
   * Get countries formatted for select options
   * @returns {Promise<Array>} - Array of country objects for select dropdown
   */
  async getCountriesForSelect() {
    try {
      const result = await this.getCountries();
      
      if (result.success) {
        return result.countries.map(country => ({
          value: country.isoCode,
          label: country.name,
          isoCode: country.isoCode
        })).sort((a, b) => a.label.localeCompare(b.label));
      }

      // Fallback to common countries if API fails
      return [
        { value: 'US', label: 'United States', isoCode: 'US' },
        { value: 'CA', label: 'Canada', isoCode: 'CA' },
        { value: 'GB', label: 'United Kingdom', isoCode: 'GB' },
        { value: 'AU', label: 'Australia', isoCode: 'AU' },
        { value: 'DE', label: 'Germany', isoCode: 'DE' },
        { value: 'FR', label: 'France', isoCode: 'FR' },
        { value: 'IT', label: 'Italy', isoCode: 'IT' },
        { value: 'ES', label: 'Spain', isoCode: 'ES' },
        { value: 'NL', label: 'Netherlands', isoCode: 'NL' },
        { value: 'SE', label: 'Sweden', isoCode: 'SE' }
      ];
    } catch (error) {
      console.error('Error getting countries for select:', error);
      return [];
    }
  }
};

// Export individual functions for easier importing
export const getCountries = () => shopifyCountriesService.getCountries();
export const getCountriesForSelect = () => shopifyCountriesService.getCountriesForSelect();
