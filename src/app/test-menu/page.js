'use client';

import { useState } from 'react';
import { getNavLinks } from '@/services/shopify/shopifyMenu';

export default function TestMenuPage() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuHandle, setMenuHandle] = useState('main-menu');

  const testGetNavLinks = async () => {
    setLoading(true);
    setError(null);
    setMenuData(null);

    try {
      const navLinks = await getNavLinks(menuHandle);
      setMenuData(navLinks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDifferentMenus = async () => {
    const testHandles = ['main-menu', 'footer-menu', 'mobile-menu'];
    const results = {};

    setLoading(true);
    setError(null);

    try {
      for (const handle of testHandles) {
        try {
          const navLinks = await getNavLinks(handle);
          results[handle] = {
            success: true,
            count: navLinks.length,
            data: navLinks
          };
        } catch (err) {
          results[handle] = {
            success: false,
            error: err.message
          };
        }
      }
      setMenuData(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testInvalidMenu = async () => {
    setLoading(true);
    setError(null);
    setMenuData(null);

    try {
      await getNavLinks('invalid-menu-handle');
    } catch (err) {
      setError(err.message);
      setMenuData({ error: err.message, type: 'invalid-menu-test' });
    } finally {
      setLoading(false);
    }
  };

  const renderNavLink = (link, level = 0) => {
    const indent = '  '.repeat(level);
    
    return (
      <div key={link.name} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 font-medium">{indent}•</span>
          <span className="font-semibold">{link.name}</span>
          <span className="text-gray-500 text-sm">({link.href})</span>
          {link.hasDropdown && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Dropdown
            </span>
          )}
        </div>
        
        {link.hasDropdown && link.dropdownItems && (
          <div className="ml-4 mt-2 space-y-2">
            {link.dropdownItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-l-2 border-gray-200 pl-4">
                {section.title && (
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {section.title}
                  </h4>
                )}
                <div className="space-y-1">
                  {section.links.map((subLink, subIndex) => (
                    <div key={subIndex} className="text-sm text-gray-600">
                      {indent}  - {subLink.name} ({subLink.url})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMenuStructure = (data) => {
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Multiple menu results
      return (
        <div className="space-y-6">
          {Object.entries(data).map(([handle, result]) => (
            <div key={handle} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Menu: {handle}
              </h3>
              {result.success ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Found {result.count} navigation items
                  </p>
                  <div className="space-y-2">
                    {result.data.map(renderNavLink)}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else if (Array.isArray(data)) {
      // Single menu result
      return (
        <div className="space-y-2">
          {data.map(renderNavLink)}
        </div>
      );
    } else {
      return <div className="text-gray-500">No menu data to display</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Shopify Menu Service Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            Test the Shopify menu service for retrieving navigation links and menu structure.
          </p>

          {/* Test Controls */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Menu Handle:
              </label>
              <input
                type="text"
                value={menuHandle}
                onChange={(e) => setMenuHandle(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g., main-menu"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={testGetNavLinks}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test Get Nav Links
              </button>
              
              <button
                onClick={testDifferentMenus}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Multiple Menus
              </button>
              
              <button
                onClick={testInvalidMenu}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Test Invalid Menu
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Testing menu service...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results Display */}
        {menuData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h2>
            
            {/* Menu Structure */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Menu Structure</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {renderMenuStructure(menuData)}
              </div>
            </div>

            {/* Raw Data */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Data</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(menuData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Service Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Function: getNavLinks(handle)</h3>
              <p className="text-gray-600 mb-2">
                Retrieves navigation links from a Shopify menu by handle.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Parameters:</strong> handle (string, default: 'main-menu')<br/>
                <strong>Returns:</strong> Array of navigation link objects<br/>
                <strong>Structure:</strong> {`{ name, href, hasDropdown, dropdownItems? }`}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expected Menu Structure</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Top-level navigation items</li>
                <li>Dropdown menus with sections</li>
                <li>Up to 3 levels of nesting</li>
                <li>Proper URL handling for relative/absolute links</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Menu Handles</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>main-menu:</strong> Primary navigation</div>
                <div><strong>footer-menu:</strong> Footer links</div>
                <div><strong>mobile-menu:</strong> Mobile navigation</div>
                <div><strong>social-menu:</strong> Social media links</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
