'use client';
import { useState } from 'react';

export default function ProductHighlights({ product }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Only show fabric and care section if there's content
  const sections = [];
  
  if (product?.fabricAndCare) {
    sections.push({
      id: 'fabric',
      title: 'FABRIC AND CARE',
      content: product.fabricAndCare
    });
  }

  // Don't render anything if no sections
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6 lg:px-40 lg:pb-32">
      {sections.map((section) => (
        <div key={section.id} className="border-t border-gray-200 pt-6">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full text-left text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="font-medium">{section.title}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections[section.id] ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {expandedSections[section.id] && (
            <div className="mt-4 text-sm text-gray-600 leading-relaxed">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 