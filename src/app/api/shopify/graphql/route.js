// app/api/shopify/graphql/route.ts
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query, variables } = await request.json();
    const shopifyEndpoint = process.env.SHOPIFY_GRAPHQL_ENDPOINT; // .../api/2024-07/graphql.json
    const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!shopifyEndpoint || !accessToken) {
      return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    }

    const resp = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: `HTTP ${resp.status}`, details: payload?.errors || payload },
        { status: 502 }
      );
    }

    if (payload.errors?.length) {
      const message = payload.errors.map((e) => e.message).join(' | ');
      return NextResponse.json({ error: message, details: payload.errors }, { status: 400 });
    }

    // Include cost info for debugging (not required by client)
    return NextResponse.json({ data: payload.data, extensions: payload.extensions });
  } catch (err) {
    console.error('Shopify GraphQL API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
