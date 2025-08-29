import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query, variables } = await request.json();

    // Server-side environment variables (private)
    const shopifyEndpoint = process.env.SHOPIFY_GRAPHQL_ENDPOINT;
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!shopifyEndpoint || !accessToken) {
      return NextResponse.json(
        { error: 'Shopify configuration missing' },
        { status: 500 }
      );
    }

    // Make the GraphQL request to Shopify
    const response = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      const errorMessage = data.errors.map(e => e.message).join(' | ');
      return NextResponse.json(
        { error: `GraphQL Error: ${errorMessage}`, details: data.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shopify GraphQL API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
