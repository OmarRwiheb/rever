'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MapPin, Plus, Edit2, Trash2, Star, Loader2 } from 'lucide-react';
import { shopifyTokenManager } from '@/services/shopify/shopifyTokenManager';
import { 
  getCustomerAddresses, 
  createCustomerAddress, 
  updateCustomerAddress, 
  deleteCustomerAddress, 
  setDefaultAddress,
  validateAddressData 
} from '@/services/shopify/shopifyAddress';
import { getCountriesForSelect } from '@/services/shopify/shopifyCountries';
import { getProvincesForCountry, getProvinceFieldName, shouldHideProvince } from '@/services/shopify/shopifyProvinces';

export default function AddressesPage() {
  const { user, isAuthenticated } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [provinceFieldName, setProvinceFieldName] = useState('Province');
  const [hideProvince, setHideProvince] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: '',
    phone: ''
  });

  // Get access token from token manager
  const accessToken = shopifyTokenManager.getToken();

  // Load addresses and countries on component mount
  useEffect(() => {
    const loadData = async () => {
      // Load countries first (doesn't require authentication)
      const countriesData = await getCountriesForSelect();
      setCountries(countriesData);
      
      if (isAuthenticated && accessToken) {
        await loadAddresses();
      } else {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, accessToken]);

  const loadAddresses = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getCustomerAddresses(accessToken);
      
      if (result.success) {
        setAddresses(result.addresses);
        setDefaultAddressId(result.defaultAddress?.id || null);
      } else {
        setError(result.message || 'Failed to load addresses');
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('An error occurred while loading addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle country change to update provinces
    if (name === 'country') {
      const countryData = getProvincesForCountry(value);
      if (countryData) {
        setProvinces(countryData.options);
        setProvinceFieldName(countryData.fieldName);
        setHideProvince(countryData.hideProvince || false);
        // Clear province when country changes
        setFormData(prev => ({
          ...prev,
          [name]: value,
          province: ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Validate address data
      const validation = validateAddressData(formData);
      if (!validation.isValid) {
        setError(validation.errors[0].message);
        setIsSubmitting(false);
        return;
      }

      let result;
      if (editingId) {
        // Update existing address
        result = await updateCustomerAddress(accessToken, editingId, formData);
      } else {
        // Create new address
        result = await createCustomerAddress(accessToken, formData);
      }

      if (result.success) {
        setSuccess(editingId ? 'Address updated successfully!' : 'Address added successfully!');
        resetForm();
        // Reload addresses to get updated data
        await loadAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to save address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    // Pre-fill with user data, but allow editing
    setFormData({
      firstName: address.firstName || user?.firstName || '',
      lastName: address.lastName || user?.lastName || '',
      company: address.company || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      zip: address.zip || '',
      country: address.country || '',
      phone: address.phone || user?.phone || ''
    });
    
    // Load province data for the selected country
    if (address.country) {
      const countryData = getProvincesForCountry(address.country);
      if (countryData) {
        setProvinces(countryData.options);
        setProvinceFieldName(countryData.fieldName);
        setHideProvince(countryData.hideProvince || false);
      }
    }
    
    setEditingId(address.id);
    setIsAdding(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const result = await deleteCustomerAddress(accessToken, addressId);
      if (result.success) {
        setSuccess('Address deleted successfully!');
        // Reload addresses to get updated data
        await loadAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to delete address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const result = await setDefaultAddress(accessToken, addressId);
      if (result.success) {
        setDefaultAddressId(addressId);
        setSuccess('Default address updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to set default address');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: user?.phone || ''
    });
    setProvinces([]);
    setProvinceFieldName('Province');
    setHideProvince(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const startAdding = () => {
    setError('');
    setSuccess('');
    setEditingId(null);
    
    // Pre-fill form with user data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: user?.phone || ''
    });
    
    setIsAdding(true);
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-awaken text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm font-montserrat-regular text-gray-700">
            You need to be logged in to manage your addresses.
          </p>
          <div className="mt-6">
            <a
              href="/account"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-gray-600 animate-spin" />
          <h3 className="mt-2 text-sm font-awaken text-gray-900">Loading addresses...</h3>
        </div>
      </div>
    );
  }

  if (addresses.length === 0 && !isAdding) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-awaken text-gray-900">No addresses yet</h3>
          <p className="mt-1 text-sm font-montserrat-regular text-gray-700">
            Add your first shipping address to get started.
          </p>
          <div className="mt-6">
            <button
              onClick={startAdding}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-awaken text-gray-900">Shipping Addresses</h3>
          <p className="mt-1 text-sm font-montserrat-regular text-gray-700">
            Manage your shipping addresses for faster checkout.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={startAdding}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-400 rounded-md p-4">
          <p className="text-sm font-montserrat-regular text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-400 rounded-md p-4">
          <p className="text-sm font-montserrat-regular text-green-700">{success}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-awaken text-gray-900 mb-2">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h4>
            <p className="text-sm font-montserrat-regular text-gray-700 mb-4">
              {editingId ? 'Update your address information below.' : 'Your name and phone number have been pre-filled from your profile. You can edit them if needed.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-montserrat-bold text-gray-900">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-montserrat-bold text-gray-900">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-montserrat-bold text-gray-700">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="address1" className="block text-sm font-montserrat-bold text-gray-900">
                  Address *
                </label>
                <input
                  type="text"
                  name="address1"
                  id="address1"
                  required
                  value={formData.address1}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-montserrat-bold text-gray-700">
                  Apartment, suite, etc. (Optional)
                </label>
                <input
                  type="text"
                  name="address2"
                  id="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900"
                />
              </div>

              <div className={`grid grid-cols-1 gap-4 ${hideProvince ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                <div>
                  <label htmlFor="city" className="block text-sm font-montserrat-bold text-gray-900">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                  />
                </div>

                {!hideProvince && (
                  <div>
                    <label htmlFor="province" className="block text-sm font-montserrat-bold text-gray-900">
                      {provinceFieldName} *
                    </label>
                    {provinces.length > 0 ? (
                      <select
                        name="province"
                        id="province"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 font-montserrat-regular"
                      >
                        <option value="">Select {provinceFieldName.toLowerCase()}</option>
                        {provinces.map((province) => (
                          <option key={province.value} value={province.value}>
                            {province.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="province"
                        id="province"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        placeholder={`Enter ${provinceFieldName.toLowerCase()}`}
                        className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="zip" className="block text-sm font-montserrat-bold text-gray-900">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    id="zip"
                    required
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP or Postal Code"
                    className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="block text-sm font-montserrat-bold text-gray-900">
                    Country *
                  </label>
                  <select
                    name="country"
                    id="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a country</option>
                    {countries.length > 0 ? (
                      countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.label}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading countries...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-montserrat-bold text-gray-900">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500 text-gray-900 font-montserrat-regular"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 border border-gray-500 rounded-lg shadow-sm text-sm font-montserrat-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-montserrat-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Save Address'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white shadow rounded-lg border border-gray-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  {address.id === defaultAddressId && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {address.id !== defaultAddressId && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-montserrat-bold text-gray-900">
                  {address.firstName} {address.lastName}
                </p>
                {address.company && (
                  <p className="text-sm font-montserrat-regular text-gray-700">{address.company}</p>
                )}
                <p className="text-sm font-montserrat-regular text-gray-700">{address.address1}</p>
                {address.address2 && (
                  <p className="text-sm font-montserrat-regular text-gray-700">{address.address2}</p>
                )}
                <p className="text-sm font-montserrat-regular text-gray-700">
                  {address.city}{address.province ? `, ${address.province}` : ''} {address.zip}
                </p>
                <p className="text-sm font-montserrat-regular text-gray-700">{address.country}</p>
                {address.phone && (
                  <p className="text-sm font-montserrat-regular text-gray-700">{address.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
