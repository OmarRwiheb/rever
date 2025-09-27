// app/api/shopify/admin/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, variables } = body;
    
    // Admin API configuration
    const shopifyEndpoint = process.env.SHOPIFY_ADMIN_GRAPHQL_ENDPOINT;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyEndpoint || !accessToken) {
      console.error('Missing Shopify Admin API configuration');
      return NextResponse.json({ 
        error: 'Shopify Admin API configuration missing. Please set SHOPIFY_ADMIN_GRAPHQL_ENDPOINT and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables.' 
      }, { status: 500 });
    }
    
    const resp = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await resp.json().catch((e) => {
      console.error('Failed to parse Admin API response:', e);
      return {};
    });

    if (!resp.ok) {
      console.error('Shopify Admin API Error:', resp.status, payload);
      return NextResponse.json(
        { error: `HTTP ${resp.status}`, details: payload?.errors || payload },
        { status: 502 }
      );
    }

    if (payload.errors?.length) {
      console.error('Shopify Admin GraphQL Errors:', payload.errors);
      const message = payload.errors.map((e) => e.message).join(' | ');
      return NextResponse.json({ error: message, details: payload.errors }, { status: 400 });
    }

    return NextResponse.json({ data: payload.data, extensions: payload.extensions });
  } catch (err) {
    console.error('Shopify Admin API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
