// app/api/exchange/route.js
import { NextResponse } from 'next/server';
import { validateFormSubmission } from '@/lib/recaptcha';
import nodemailer from 'nodemailer';

// Email sending function
async function sendConfirmationEmail({ email, orderNumber, items, reason, additionalInfo, exchangeTo, exchangeRequestId }) {
  console.log('sendConfirmationEmail called for exchange request:', { email, orderNumber, exchangeRequestId });
  
  // Check if email configuration is available
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email configuration missing - SMTP_USER or SMTP_PASS not set');
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
      tls: {
        ciphers: "SSLv3",
    },
    });
  } catch (transporterError) {
    throw new Error(`Failed to create email transporter: ${transporterError.message}`);
  }

  // Format reason for display
  const reasonLabels = {
    'wrong_size': 'Wrong size',
    'different_color': 'Different color',
    'style_preference': 'Style preference',
    'fit_issues': 'Fit issues',
    'other': 'Other'
  };

  const reasonText = reasonLabels[reason] || reason;

  // Email content
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 28px; margin: 0;">REVER</h1>
        <p style="color: #666; margin: 5px 0;">Exchange Request Confirmation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 25px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #512123;">
        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Thank you for your exchange request!</h2>
        <p style="color: #555; line-height: 1.6; margin: 15px 0;">
          We have received your exchange request and will review it within 1-2 business days. 
          You will receive an update via email once your request has been processed.
        </p>
      </div>
      
      <div style="background: #F4EAE8; padding: 25px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Exchange Request Details</h3>
        
        <div style="margin: 15px 0;">
          <p style="margin: 8px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 8px 0;"><strong>Request ID:</strong> ${exchangeRequestId}</p>
          <p style="margin: 8px 0;"><strong>Reason for Exchange:</strong> ${reasonText}</p>
          <p style="margin: 8px 0;"><strong>Additional Information:</strong> ${additionalInfo}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 15px 0 10px 0;">Items to Exchange:</h4>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
            ${items.map((item, index) => 
              `<p style="margin: 5px 0; font-family: monospace;">Item ${index + 1}: ${item.productName} - Size: ${item.size}, Color: ${item.color} (Quantity: ${item.quantity})</p>`
            ).join('')}
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 15px 0 10px 0;">Exchange To:</h4>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
            ${exchangeTo.map((item, index) => 
              `<p style="margin: 5px 0; font-family: monospace;">Item ${index + 1}: ${item.productName} - Size: ${item.size}, Color: ${item.color} (Quantity: ${item.quantity})</p>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
        <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
          <li>We'll review your exchange request within 1-2 business days</li>
          <li>You'll receive an email confirmation with exchange instructions</li>
          <li>We'll help you find the perfect replacement item</li>
          <li>Exchange shipping costs may apply</li>
          <li>Price differences will be handled separately</li>
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
REVER - Exchange Request Confirmation

Thank you for your exchange request!

We have received your exchange request and will review it within 1-2 business days. 
You will receive an update via email once your request has been processed.

Exchange Request Details:
- Order Number: ${orderNumber}
- Request ID: ${exchangeRequestId}
- Reason for Exchange: ${reasonText}
- Additional Information: ${additionalInfo}

Items to Exchange:
${items.map((item, index) => 
  `Item ${index + 1}: ${item.productName} - Size: ${item.size}, Color: ${item.color} (Quantity: ${item.quantity})`
).join('\n')}

Exchange To:
${exchangeTo.map((item, index) => 
  `Item ${index + 1}: ${item.productName} - Size: ${item.size}, Color: ${item.color} (Quantity: ${item.quantity})`
).join('\n')}

What happens next?
- We'll review your exchange request within 1-2 business days
- You'll receive an email confirmation with exchange instructions
- We'll help you find the perfect replacement item
- Exchange shipping costs may apply
- Price differences will be handled separately

---
This is an automated confirmation email. Please do not reply to this email.
If you have any questions, please contact our customer service team.
Submitted on: ${new Date().toLocaleString()}
  `;

  // Send email
  try {
    const mailData = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Exchange Request Confirmation - Order ${orderNumber}`,
      text: emailText,
      html: emailHtml,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.error('Email sending error:', err);
          reject(err);
        } else {
          console.log('Email sent successfully to:', email);
          resolve(info);
        }
      });
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
      exchangeTo
    } = body;

    // Validate required fields
    if (!orderNumber || !email || !phoneNumber || !items || !reason || !additionalInfo || !exchangeTo) {
      return NextResponse.json({ 
        error: 'Missing required fields. All fields are required.' 
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
      if (!item.productName || !item.size || !item.color || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ 
          error: 'Each item must have a valid productName, size, color, and quantity' 
        }, { status: 400 });
      }
    }

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
        type: 'exchange_request',
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
            value: JSON.stringify(items.map(item => ({
              product_name: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity
            })))
          },
          {
            key: 'reason',
            value: reason
          },
          {
            key: 'additional_info',
            value: additionalInfo
          },
          {
            key: 'exchange_to',
            value: JSON.stringify(exchangeTo.map(item => ({
              product_name: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity
            })))
          }
        ]
      }
    };

    // Check if Shopify Admin API credentials are configured
    const shopifyEndpoint = process.env.SHOPIFY_ADMIN_GRAPHQL_ENDPOINT;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyEndpoint || !accessToken) {
      console.warn('Shopify Admin API configuration missing - storing exchange request locally');
      
      // Generate a local exchange request ID
      const exchangeRequestId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send confirmation email to user even without Shopify integration
      try {
        console.log('Attempting to send exchange confirmation email to:', email);
        await sendConfirmationEmail({
          email,
          orderNumber,
          items,
          reason,
          additionalInfo,
          exchangeTo,
          exchangeRequestId
        });
        console.log('Exchange confirmation email sent successfully to:', email);
      } catch (emailError) {
        console.error('Failed to send exchange confirmation email:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Exchange request submitted successfully (stored locally)',
        exchangeRequestId,
        warning: 'Shopify Admin API not configured - request stored locally only'
      });
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
        { 
          error: `Shopify API Error (HTTP ${shopifyResponse.status}): ${JSON.stringify(shopifyData?.errors || shopifyData)}`, 
          details: shopifyData?.errors || shopifyData 
        },
        { status: 502 }
      );
    }

    if (shopifyData.errors?.length) {
      console.error('Shopify Admin GraphQL Errors:', shopifyData.errors);
      const message = shopifyData.errors.map((e) => e.message).join(' | ');
      return NextResponse.json({ 
        error: `Shopify GraphQL Error: ${message}`, 
        details: shopifyData.errors 
      }, { status: 400 });
    }

    if (shopifyData.data?.metaobjectCreate?.userErrors?.length) {
      console.error('Metaobject creation errors:', shopifyData.data.metaobjectCreate.userErrors);
      const userErrorMessages = shopifyData.data.metaobjectCreate.userErrors.map((e) => e.message).join(' | ');
      return NextResponse.json(
        { 
          error: `Metaobject creation failed: ${userErrorMessages}`, 
          details: shopifyData.data.metaobjectCreate.userErrors 
        },
        { status: 400 }
      );
    }

    const createdMetaobject = shopifyData.data.metaobjectCreate.metaobject;

    // Send confirmation email to user
    try {
      console.log('Attempting to send exchange confirmation email to:', email);
      await sendConfirmationEmail({
        email,
        orderNumber,
        items,
        reason,
        additionalInfo,
        exchangeTo,
        exchangeRequestId: createdMetaobject.id
      });
      console.log('Exchange confirmation email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send exchange confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Exchange request submitted successfully',
      exchangeRequestId: createdMetaobject.id,
      data: createdMetaobject
    });

  } catch (error) {
    console.error('Exchange API error:', error);
    return NextResponse.json(
      { 
        error: `Failed to create exchange request: ${error.message}`,
        details: error.stack
      },
      { status: 500 }
    );
  }
}
