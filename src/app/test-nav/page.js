'use client';

import Link from 'next/link';

export default function TestNavigationPage() {
  const testPages = [
    {
      title: 'Shopify Menu Test',
      description: 'Test the Shopify menu service for navigation links',
      path: '/test-menu',
      features: [
        'Test getNavLinks() function',
        'Test different menu handles',
        'Test invalid menu handling',
        'Display menu structure',
        'Show raw API responses'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Pages Navigation
          </h1>
          <p className="text-xl text-gray-600">
            Access available test pages for Shopify services
          </p>
        </div>

        <div className="grid gap-8">
          {testPages.map((page) => (
            <div key={page.path} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {page.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {page.description}
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features:</h3>
                <ul className="space-y-2">
                  {page.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={page.path}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to {page.title}
              </Link>
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚠️ Setup Required
          </h3>
          <p className="text-yellow-700 mb-4">
            Before testing, make sure you have set up the following environment variables:
          </p>
          <div className="space-y-2 text-sm text-yellow-700">
            <div><strong>SHOPIFY_GRAPHQL_ENDPOINT:</strong> Your Shopify GraphQL endpoint URL</div>
            <div><strong>SHOPIFY_STOREFRONT_ACCESS_TOKEN:</strong> Your Shopify storefront access token</div>
          </div>
          <p className="text-yellow-700 mt-4 text-sm">
            These can be set in a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in your project root.
          </p>
        </div>
      </div>
    </div>
  );
}
