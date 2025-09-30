'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { shopifyService } from '../../services/shopify/shopify';
import { useCart } from '../../contexts/CartContext';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';

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
  const [addingToCart, setAddingToCart] = useState({});
  const [addToCartMessage, setAddToCartMessage] = useState({});
  
  const { addToCart } = useCart();

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

  // Function to add all in-stock products from a lookbook to cart
  const handleAddAllToCart = async (lookbookId, lookbookName) => {
    setAddingToCart(prev => ({ ...prev, [lookbookId]: true }));
    setAddToCartMessage(prev => ({ ...prev, [lookbookId]: '' }));

    try {
      // Get the lookbook data
      const lookbook = lookbooks.find(l => l.id === lookbookId);
      if (!lookbook || !lookbook.productIds || lookbook.productIds.length === 0) {
        setAddToCartMessage(prev => ({ 
          ...prev, 
          [lookbookId]: 'No products available' 
        }));
        setTimeout(() => {
          setAddToCartMessage(prev => ({ ...prev, [lookbookId]: '' }));
        }, 3000);
        return;
      }

      // Fetch products for this lookbook
      const productPromises = lookbook.productIds.map(productId => 
        shopifyService.getProductById(productId).catch(err => {
          console.warn(`Failed to fetch product ${productId}:`, err);
          return null;
        })
      );
      
      const productResults = await Promise.all(productPromises);
      const products = productResults.filter(product => product !== null);

      let addedCount = 0;
      let skippedCount = 0;
      const errors = [];

      // Process each product
      for (const product of products) {
        if (!product.variants || product.variants.length === 0) {
          skippedCount++;
          continue;
        }

        // Find the first available variant for this product
        const availableVariant = product.variants.find(variant => 
          variant.availableForSale && (variant.quantityAvailable === null || variant.quantityAvailable === undefined || variant.quantityAvailable > 0)
        );

        if (availableVariant) {
          try {
            const result = await addToCart(availableVariant.id, 1);
            
            if (result.success) {
              addedCount++;
            } else {
              errors.push(`${product.name}: ${result.error || 'Failed to add'}`);
            }
          } catch (error) {
            const errorMsg = `${product.name}: ${error.message || 'Failed to add'}`;
            console.error(`Error adding ${product.name} to cart:`, error);
            errors.push(errorMsg);
          }
        } else {
          skippedCount++;
        }
      }

      // Show result message
      if (addedCount > 0) {
        if (skippedCount > 0) {
          setAddToCartMessage(prev => ({ 
            ...prev, 
            [lookbookId]: `${addedCount} items added to cart, ${skippedCount} out of stock` 
          }));
        } else {
          setAddToCartMessage(prev => ({ 
            ...prev, 
            [lookbookId]: `${addedCount} items added to cart!` 
          }));
        }
      } else {
        setAddToCartMessage(prev => ({ 
          ...prev, 
          [lookbookId]: 'No items available to add to cart' 
        }));
      }

      // Log any errors
      if (errors.length > 0) {
        console.warn('Some products failed to add to cart:', errors);
      }

    } catch (error) {
      console.error('Error adding products to cart:', error);
      setAddToCartMessage(prev => ({ 
        ...prev, 
        [lookbookId]: 'Error adding items to cart' 
      }));
    } finally {
      setAddingToCart(prev => ({ ...prev, [lookbookId]: false }));
      setTimeout(() => {
        setAddToCartMessage(prev => ({ ...prev, [lookbookId]: '' }));
      }, 5000);
    }
  };

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
    return <LoadingScreen message="Loading lookbooks..." />;
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
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-lg font-light text-gray-900 mb-4 text-center">
            LOOK BOOKS
          </h1>
        </div>
      </div> */}

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
                          
                          {/* Plus icon overlay - Add All to Cart */}
                          <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddAllToCart(lookbook.id, lookbook.name);
                              }}
                              disabled={addingToCart[lookbook.id]}
                              className={`p-2 rounded-full transition-all duration-200 ${
                                addingToCart[lookbook.id]
                                  ? 'cursor-not-allowed'
                                  : ''
                              }`}
                              title="Add all products to cart"
                            >
                              {addingToCart[lookbook.id] ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  fill="none" 
                                  className="text-white"
                                >
                                  <path 
                                    stroke="currentColor" 
                                    strokeWidth="1.5"
                                    d="M20 12H4M12 20V4"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          
                          {/* Look info overlay on hover */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-sm font-medium">{lookbook.name}</h3>
                            <p className="text-xs text-gray-200">View Look</p>
                          </div>
                          
                          {/* Add to Cart Status Message */}
                          {addToCartMessage[lookbook.id] && (
                            <div className="absolute top-16 right-4 bg-white text-black text-xs px-3 py-2 rounded shadow-lg max-w-xs">
                              {addToCartMessage[lookbook.id]}
                            </div>
                          )}
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
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 