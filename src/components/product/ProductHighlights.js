'use client';
import { useState } from 'react';

export default function ProductHighlights() {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'fabric',
      title: 'FABRIC AND CARE',
      content: 'Made from 100% cotton with a flowing fabric that drapes beautifully. Machine wash cold, tumble dry low.'
    },
    {
      id: 'shipping',
      title: 'SHIPPING, EXCHANGES AND RETURNS',
      content: 'Free shipping on orders over EGP 1,000. Easy returns within 30 days. Exchange available for different sizes.'
    }
  ];

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