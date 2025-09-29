// app/api/returns/route.js
import { NextResponse } from 'next/server';
import { validateFormSubmission } from '@/lib/recaptcha';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      orderNumber, 
      email, 
      phoneNumber, 
      items, 
      reason, 
      additionalInfo,
      recaptchaToken 
    } = body;

    // Validate required fields
    if (!orderNumber || !email || !phoneNumber || !items || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'At least one item is required' 
      }, { status: 400 });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.itemId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ 
          error: 'Each item must have a valid itemId and quantity' 
        }, { status: 400 });
      }
    }

    // Verify reCAPTCHA if token provided
    // if (recaptchaToken) {
    //   try {
    //     await validateFormSubmission(null, 'returns', recaptchaToken);
    //   } catch (error) {
    //     console.error('reCAPTCHA verification failed:', error);
    //     return NextResponse.json({ 
    //       error: 'reCAPTCHA verification failed' 
    //     }, { status: 400 });
    //   }
    // }

    // Format products data according to the JSON schema
    const productsData = items.map(item => ({
      product_id: parseInt(item.itemId),
      quantity: parseInt(item.quantity)
    }));

    // Create metaobject mutation
    const mutation = `
      mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            id
            handle
            type
            fields {
              key
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      metaobject: {
        type: 'return_request',
        fields: [
          {
            key: 'order_number',
            value: orderNumber
          },
          {
            key: 'email',
            value: email
          },
          {
            key: 'phone_number',
            value: phoneNumber
          },
          {
            key: 'products',
            value: JSON.stringify(productsData)
          },
          {
            key: 'reason_for_return',
            value: reason
          },
          {
            key: 'additional_info',
            value: additionalInfo || ''
          }
        ]
      }
    };

    // Check if Shopify Admin API credentials are configured
    const shopifyEndpoint = process.env.SHOPIFY_ADMIN_GRAPHQL_ENDPOINT;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyEndpoint || !accessToken) {
      console.error('Missing Shopify Admin API configuration');
      return NextResponse.json({ 
        error: 'Shopify Admin API configuration missing. Please set SHOPIFY_ADMIN_GRAPHQL_ENDPOINT and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables.' 
      }, { status: 500 });
    }

    // Call Shopify Admin API directly
    const shopifyResponse = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const shopifyData = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
      console.error('Shopify Admin API Error:', shopifyResponse.status, shopifyData);
      return NextResponse.json(
        { error: `HTTP ${shopifyResponse.status}`, details: shopifyData?.errors || shopifyData },
        { status: 502 }
      );
    }

    if (shopifyData.errors?.length) {
      console.error('Shopify Admin GraphQL Errors:', shopifyData.errors);
      const message = shopifyData.errors.map((e) => e.message).join(' | ');
      return NextResponse.json({ error: message, details: shopifyData.errors }, { status: 400 });
    }

    if (shopifyData.data?.metaobjectCreate?.userErrors?.length) {
      console.error('Metaobject creation errors:', shopifyData.data.metaobjectCreate.userErrors);
      return NextResponse.json(
        { error: 'Failed to create return request', details: shopifyData.data.metaobjectCreate.userErrors },
        { status: 400 }
      );
    }

    const createdMetaobject = shopifyData.data.metaobjectCreate.metaobject;

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      returnRequestId: createdMetaobject.id,
      data: createdMetaobject
    });

  } catch (error) {
    console.error('Returns API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
