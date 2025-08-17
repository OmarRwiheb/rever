'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function MeasurementTablePopup({ isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState('S');
  const [showInches, setShowInches] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  
  const measurements = {
    cm: {
      S: { chest: 90, hip: 88 },
      M: { chest: 94, hip: 92 },
      L: { chest: 98, hip: 96 },
      XL: { chest: 102, hip: 100 },
      XXL: { chest: 106, hip: 104 }
    },
    inches: {
      S: { chest: 35.4, hip: 34.6 },
      M: { chest: 37.0, hip: 36.2 },
      L: { chest: 38.6, hip: 37.8 },
      XL: { chest: 40.2, hip: 39.4 },
      XXL: { chest: 41.7, hip: 40.9 }
    }
  };

  const currentUnit = showInches ? 'inches' : 'cm';
  const currentMeasurements = measurements[currentUnit];

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Handle closing animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">MEASUREMENTS</h2>
            <div className="w-6"></div> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">SELECT SIZE</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Measurement Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">MEASUREMENTS</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chest
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hip
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sizes.map((size) => (
                      <tr key={size} className={selectedSize === size ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {size}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {currentMeasurements[size].chest} {showInches ? 'in' : 'cm'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {currentMeasurements[size].hip} {showInches ? 'in' : 'cm'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={() => setShowInches(!showInches)}
                className="text-sm text-gray-600 hover:text-gray-900 underline mt-3"
              >
                {showInches ? 'See in cm' : 'See in inches'}
              </button>
            </div>

            {/* How to Take Measurements */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">HOW TO TAKE MEASUREMENTS</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="relative mb-4">
                  {/* Placeholder for measurement diagram */}
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-xs font-bold">2</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong>CHEST:</strong> Measure the chest circumference at the widest part of the chest below the underarms.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong>HIP:</strong> Measure the circumference of the hips at their widest part, around the buttocks.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Chest measurements are taken with the garment positioned flat. To determine the total circumference, it is necessary to multiply it by two.
              </p>
              <p>
                Products may arrive with some variation, as measurements shown may not be 100% accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
