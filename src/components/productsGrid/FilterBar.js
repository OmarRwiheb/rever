'use client';
import { useState, useEffect, useRef } from 'react';

export default function FilterBar({ totalItems = 36, onViewModeChange, onFiltersChange, onSortChange, sortBy = 'featured', products = [] }) {
  const [viewMode, setViewMode] = useState('grid-6');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  // Get unique colors and sizes from products
  const uniqueColors = [...new Set(products.flatMap(product => product.colors || []).filter(Boolean))];
  const uniqueSizes = [...new Set(products.flatMap(product => product.sizes || []).filter(Boolean))];

  // Click outside handler for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };

  const handleColorChange = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    applyFilters(newColors, selectedSizes);
  };

  const handleSizeChange = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    applyFilters(selectedColors, newSizes);
  };

  const applyFilters = (colors, sizes) => {
    if (onFiltersChange) {
      onFiltersChange({ colors, sizes });
    }
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    applyFilters([], []);
  };

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0;

  return (
    <div className="relative top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Filter Bar */}
        <div className="flex flex-col space-y-4 py-4 sm:py-6">
          {/* Top Row - Filters and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Left Side - Filter Button */}
            <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="group relative inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-black text-white text-xs font-bold rounded-full animate-pulse">
                    {selectedColors.length + selectedSizes.length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-2 py-2 sm:px-3 sm:py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Clear all</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>

            {/* Right Side - Sort, View Toggle, Item Count */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              {/* Sort Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center justify-center sm:justify-start">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M3 12h18M3 16h18" />
                  </svg>
                  Sort by:
                </span>
                <div className="relative group" ref={sortDropdownRef}>
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center justify-between w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-sm min-w-[160px] group-hover:border-gray-300 group-hover:shadow-sm"
                  >
                    <span className="flex items-center">
                      {sortBy === 'featured' && (
                        <>
                          <span>Featured</span>
                        </>
                      )}
                      {sortBy === 'price-low' && (
                        <>
                          <span>Price: Low to High</span>
                        </>
                      )}
                      {sortBy === 'price-high' && (
                        <>
                          <span>Price: High to Low</span>
                        </>
                      )}
                      {sortBy === 'newest' && (
                        <>
                          <span>Newest</span>
                        </>
                      )}
                      {sortBy === 'name' && (
                        <>
                          <span>Name: A to Z</span>
                        </>
                      )}
                    </span>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                        <svg className={`w-3 h-3 text-gray-500 group-hover:text-gray-700 transition-all duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {/* Custom Dropdown Menu */}
                  <div className={`absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                    showSortDropdown 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="py-2">
                      {[
                        { value: 'featured', label: 'Featured', description: 'Best picks first' },
                        { value: 'price-low', label: 'Price: Low to High', description: 'Cheapest first' },
                        { value: 'price-high', label: 'Price: High to Low', description: 'Most expensive first' },
                        { value: 'newest', label: 'Newest', description: 'Latest arrivals first' },
                        { value: 'name', label: 'Name: A to Z', description: 'Alphabetical order' }
                      ].map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortChange(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 group ${
                            sortBy === option.value ? 'bg-gray-100 border-r-4 border-black' : ''
                          }`}
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className="flex-1">
                            <div className={`font-medium ${sortBy === option.value ? 'text-black' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                            <div className={`text-xs ${sortBy === option.value ? 'text-gray-600' : 'text-gray-500'}`}>
                              {option.description}
                            </div>
                          </div>
                          {sortBy === option.value && (
                            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('grid-2')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid-2' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                    title="2 Columns"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 16a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM13 4a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM13 16a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid-6')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid-6' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                    title="6 Columns"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('grid-12')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid-12' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                    title="12 Columns"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM2 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V9zM2 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zM8 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3zM8 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V9zM8 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2zM14 3a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V3zM14 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V9zM14 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Item Count */}
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-sm font-medium text-gray-700">{totalItems}</span>
                <span className="text-sm text-gray-500">items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-gray-200 py-3 sm:py-4 bg-gray-50">
            <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <span className="text-sm font-medium text-gray-700 text-center sm:text-left">Active filters:</span>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {selectedColors.map(color => (
                  <span 
                    key={`color-${color}`}
                    className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition-all duration-200 group"
                  >
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black mr-1 sm:mr-2 border border-gray-300"></div>
                    <span className="hidden xs:inline">{color.toLowerCase()}</span>
                    <span className="xs:hidden">{color.toLowerCase().substring(0, 3)}</span>
                    <button
                      onClick={() => handleColorChange(color)}
                      className="ml-1 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedSizes.map(size => (
                  <span 
                    key={`size-${size}`}
                    className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition-all duration-200 group"
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {size}
                    <button
                      onClick={() => handleSizeChange(size)}
                      className="ml-1 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        <div className={`border-t border-gray-200 transition-all duration-500 ease-in-out overflow-hidden ${
          showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`py-6 sm:py-8 transition-all duration-300 ${showFilters ? 'translate-y-0' : '-translate-y-4'}`}>
            <div className="max-h-[500px] overflow-y-auto pr-2 filter-panel-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                {/* Color Filter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 rounded-full shadow-sm"></div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Color</h3>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">({uniqueColors.length} options)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 filter-grid">
                    {uniqueColors.map((color, index) => (
                      <label 
                        key={color} 
                        className={`relative flex items-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm group transform hover:scale-[1.02] filter-option ${
                          selectedColors.includes(color) ? 'border-black bg-gray-100 shadow-sm' : 'border-gray-200'
                        } ${showFilters ? 'animate-fadeInUp' : ''}`}
                        style={{ 
                          animationDelay: `${index * 75}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => handleColorChange(color)}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 mr-2 sm:mr-3 transition-all duration-200 ${
                          selectedColors.includes(color)
                            ? 'bg-black border-black'
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {selectedColors.includes(color) && (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">{color.toLowerCase()}</span>
                        </div>
                        {selectedColors.includes(color) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Size</h3>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">({uniqueSizes.length} options)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 filter-grid">
                    {uniqueSizes.map((size, index) => (
                      <label 
                        key={size} 
                        className={`relative flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm group transform hover:scale-[1.02] filter-option ${
                          selectedSizes.includes(size) ? 'border-black bg-gray-100 shadow-sm' : 'border-gray-200'
                        } ${showFilters ? 'animate-fadeInUp' : ''}`}
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => handleSizeChange(size)}
                          className="sr-only"
                        />
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 mr-1 sm:mr-2 transition-all duration-200 ${
                          selectedSizes.includes(size)
                            ? 'bg-black border-black'
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {selectedSizes.includes(size) && (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{size}</span>
                        {selectedSizes.includes(size) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 