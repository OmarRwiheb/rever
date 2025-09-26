'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { shopifyService } from '../../services/shopify/shopify';

// Function to dynamically create rows from lookbooks array
const createLookRows = (lookbooksArray) => {
  const rows = [];
  let currentRow = [];
  let patternIndex = 0;

  const basePattern = [1, 2, 2]; // your repeating rule

  for (let i = 0; i < lookbooksArray.length; i++) {
    currentRow.push(lookbooksArray[i]);

    // pick pattern size based on repeating base pattern
    const currentPattern = basePattern[patternIndex % basePattern.length];

    const shouldCreateRow =
      currentRow.length === currentPattern ||
      i === lookbooksArray.length - 1;

    if (shouldCreateRow) {
      rows.push([...currentRow]);
      currentRow = [];
      patternIndex++;
    }
  }

  return rows;
};

export default function LookbookPage() {
  const [activeTab, setActiveTab] = useState('lookbook');
  const [lookbooks, setLookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLookbooks = async () => {
      try {
        setLoading(true);
        const data = await shopifyService.getLookbooks();
        setLookbooks(data);
      } catch (err) {
        console.error('Error fetching lookbooks:', err);
        setError('Failed to load lookbooks');
      } finally {
        setLoading(false);
      }
    };

    fetchLookbooks();
  }, []);

  const getSizeClass = (rowLength, index, rowIndex) => {
    if (rowLength === 1) {
      return 'w-full md:w-4/12'; // Single element gets large size
    } else {
      // Two elements row - alternate small element position
      const isEvenTwoElementRow = (rowIndex % 2 === 0); // Simple even/odd alternation
      
      if (isEvenTwoElementRow) {
        // Even two-element rows: large on left, small on right
        if (index === 0) {
          return 'w-1/2 '; // First element: large
        } else {
          return 'w-1/2 '; // Second element: small
        }
      } else {
        // Odd two-element rows: small on left, large on right
        if (index === 0) {
          return 'w-1/2 '; // First element: small
        } else {
          return 'w-1/2 '; // Second element: large
        }
      }
    }
  };

  // Dynamically create rows from lookbooks data
  const lookRows = createLookRows(lookbooks);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lookbooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-lg font-light text-gray-900 mb-4 text-center">
            {lookbooks.length > 0 ? `${lookbooks[0].category.toUpperCase()} LOOKBOOK` : 'LOOKBOOK'}
          </h1>
        </div>
      </div>

      {/* Lookbook Grid - Row-based Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-25">
          {lookRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap -mx-2 justify-center gap-10">
              {row.map((lookbook, index) => {
                let containerStyle = {};
                let elementStyle = {};
                
                if (row.length === 1) {
                  // Single element - centered with margin
                  containerStyle = {};
                  elementStyle = { width: '90%', margin: '0 auto' };
                } else {
                  // Two elements - alternating sizes with margins
                  const isEvenRow = rowIndex % 2 === 0;
                  if (isEvenRow) {
                    // Even rows: large on left, small on right
                    if (index === 0) {
                      containerStyle = {};
                      elementStyle = { width: '100%', marginRight: 'auto' };
                    } else {
                      containerStyle = {};
                      elementStyle = { width: '70%', marginRight: 'auto' };
                    }
                  } else {
                    // Odd rows: small on left, large on right
                    if (index === 0) {
                      containerStyle = {};
                      elementStyle = { width: '70%', marginRight: 'auto' };
                    } else {
                      containerStyle = {};
                      elementStyle = { width: '100%', marginRight: 'auto' };
                    }
                  }
                }
                
                return (
                  <div 
                    key={lookbook.id}
                    className="px-2 w-full md:w-[40%]"
                    style={containerStyle}
                  >
                    <Link href={`/lookbook/${lookbook.handle}`}>
                      <div 
                        className="relative group cursor-pointer overflow-hidden w-1/2"
                        style={elementStyle}
                      >
                        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                          <img
                            src={lookbook.imageUrl}
                            alt={lookbook.name}
                            className="w-full h-full object-cover transition-transform duration-500"
                          />
                          
                          {/* Plus icon overlay */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              fill="none" 
                              className="text-white"
                            >
                              <path 
                                stroke="currentColor" 
                                strokeWidth="1.5"
                                d="M20 12H4M12 20V4"
                              />
                            </svg>
                          </div>
                          
                          {/* Look info overlay on hover */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-sm font-medium">{lookbook.name}</h3>
                            <p className="text-xs text-gray-200">View Look</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 