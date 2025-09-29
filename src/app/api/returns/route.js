// app/api/returns/route.js
import { NextResponse } from 'next/server';
import { validateFormSubmission } from '@/lib/recaptcha';
import nodemailer from 'nodemailer';

// Email sending function
async function sendConfirmationEmail({ email, orderNumber, items, reason, additionalInfo, instapay, returnRequestId }) {
  // Check if email configuration is available
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }

  // Create email transporter
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (transporterError) {
    throw new Error(`Failed to create email transporter: ${transporterError.message}`);
  }

  // Format reason for display
  const reasonLabels = {
    'not_as_described': 'Item not as described',
    'wrong_size': 'Wrong size',
    'defective': 'Defective/Damaged item',
    'quality_issues': 'Quality issues',
    'fit_issues': 'Not satisfied with fit',
    'other': 'Other'
  };

  const reasonText = reasonLabels[reason] || reason;

  // Format items for display
  const itemsList = items.map((item, index) => 
    `Item ${index + 1}: ID ${item.itemId} (Quantity: ${item.quantity})`
  ).join('\n');

  // Email content
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 28px; margin: 0;">REVER</h1>
        <p style="color: #666; margin: 5px 0;">Return Request Confirmation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 25px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #000;">
        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Thank you for your return request!</h2>
        <p style="color: #555; line-height: 1.6; margin: 15px 0;">
          We have received your return request and will review it within 1-2 business days. 
          You will receive an update via email once your request has been processed.
        </p>
      </div>
      
      <div style="background: #fff; padding: 25px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Return Request Details</h3>
        
        <div style="margin: 15px 0;">
          <p style="margin: 8px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 8px 0;"><strong>Request ID:</strong> ${returnRequestId}</p>
          <p style="margin: 8px 0;"><strong>Reason for Return:</strong> ${reasonText}</p>
          ${instapay ? `<p style="margin: 8px 0;"><strong>Instapay Phone:</strong> ${instapay}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 15px 0 10px 0;">Items to Return:</h4>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
            ${itemsList.split('\n').map(item => `<p style="margin: 5px 0; font-family: monospace;">${item}</p>`).join('')}
          </div>
        </div>
        
        ${additionalInfo ? `
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 15px 0 10px 0;">Additional Information:</h4>
          <p style="background: #f8f8f8; padding: 15px; border-radius: 5px; white-space: pre-wrap; line-height: 1.6;">${additionalInfo}</p>
        </div>
        ` : ''}
      </div>
      
      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
        <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
          <li>We'll review your return request within 1-2 business days</li>
          <li>You'll receive an email confirmation with return instructions</li>
          <li>Refunds will be processed through Instapay only</li>
          <li>Return shipping costs may apply depending on the reason</li>
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center;">
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
        <p>If you have any questions, please contact our customer service team.</p>
        <p>Submitted on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const emailText = `
REVER - Return Request Confirmation

Thank you for your return request!

We have received your return request and will review it within 1-2 business days. 
You will receive an update via email once your request has been processed.

Return Request Details:
- Order Number: ${orderNumber}
- Request ID: ${returnRequestId}
- Reason for Return: ${reasonText}
${instapay ? `- Instapay Phone: ${instapay}` : ''}

Items to Return:
${itemsList}

${additionalInfo ? `Additional Information:\n${additionalInfo}\n` : ''}

What happens next?
- We'll review your return request within 1-2 business days
- You'll receive an email confirmation with return instructions
- Refunds will be processed through Instapay only
- Return shipping costs may apply depending on the reason

---
This is an automated confirmation email. Please do not reply to this email.
If you have any questions, please contact our customer service team.
Submitted on: ${new Date().toLocaleString()}
  `;

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Return Request Confirmation - Order ${orderNumber}`,
      text: emailText,
      html: emailHtml,
    });
  } catch (emailError) {
    throw new Error(`Failed to send email: ${emailError.message}`);
  }
}

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
      instapay,
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
          },
          {
            key: 'instapay',
            value: instapay || ''
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

    // Send confirmation email to user
    try {
      await sendConfirmationEmail({
        email,
        orderNumber,
        items,
        reason,
        additionalInfo,
        instapay,
        returnRequestId: createdMetaobject.id
      });
    } catch (emailError) {
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      returnRequestId: createdMetaobject.id,
      data: createdMetaobject
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
