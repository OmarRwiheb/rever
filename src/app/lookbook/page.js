'use client';
import Link from 'next/link';
import { useState } from 'react';

const looks = [
  {
    id: 1,
    title: "Look 1",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 2,
    title: "Look 2", 
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 3,
    title: "Look 3",
    image: "/img/lookbook.jpg", 
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 4,
    title: "Look 4",
    image: "/img/lookbook.jpg",
    category: "Women", 
    season: "Fall 2025"
  },
  {
    id: 5,
    title: "Look 5",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 6,
    title: "Look 6",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 7,
    title: "Look 7",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 8,
    title: "Look 8",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 9,
    title: "Look 9",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  {
    id: 10,
    title: "Look 10",
    image: "/img/lookbook.jpg",
    category: "Women",
    season: "Fall 2025"
  },
  
];

// Function to dynamically create rows from looks array
const createLookRows = (looksArray) => {
  const rows = [];
  let currentRow = [];
  let patternIndex = 0; // Track position in the pattern
  
  for (let i = 0; i < looksArray.length; i++) {
    currentRow.push(looksArray[i]);
    
    // Pattern: 1, 2, 2, 1, 2, 2, 1, 2, 2, etc.
    const pattern = [1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2];
    const currentPattern = pattern[patternIndex % pattern.length];
    
    const shouldCreateRow = 
      currentRow.length === currentPattern || // Match pattern
      i === looksArray.length - 1; // Last element
    
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

  // Dynamically create rows from looks data
  const lookRows = createLookRows(looks);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-lg font-light text-gray-900 mb-4 text-center">
            WOMEN FALL 25 LOOKS
          </h1>
        </div>
      </div>

      {/* Lookbook Grid - Row-based Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-25">
          {lookRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap -mx-2 justify-center gap-10">
              {row.map((look, index) => {
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
                    key={look.id}
                    className="px-2 w-full md:w-[40%]"
                    style={containerStyle}
                  >
                    <div 
                      className="relative group cursor-pointer overflow-hidden w-1/2"
                      style={elementStyle}
                    >
                      <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
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
                      </div>
                    </div>
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