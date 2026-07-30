export interface OrderEmailTemplateParams {
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  userName: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPrice: number;
}

export function generateOrderStatusHtml(params: OrderEmailTemplateParams): string {
  const { status, userName, orderId, items, totalPrice } = params;

  const statusColors = {
    Processing: '#3b82f6', // Blue
    Shipped: '#f59e0b',    // Amber
    Delivered: '#10b981',  // Green
    Cancelled: '#ef4444',  // Red
  };

  const statusTitles = {
    Processing: 'Order Confirmed! 🛍️',
    Shipped: 'Your Order Has Shipped! 🚚',
    Delivered: 'Order Delivered! 🎉',
    Cancelled: 'Order Cancelled ❌',
  };

  const statusSubtitles = {
    Processing: 'Thank you for your purchase! We are currently processing your order.',
    Shipped: 'Great news! Your package is on its way.',
    Delivered: 'Your order has been delivered successfully. We hope you love your purchase!',
    Cancelled: 'Your order has been cancelled and any payments have been processed accordingly.',
  };

  const currentColor = statusColors[status] || '#3b82f6';
  const currentTitle = statusTitles[status] || 'Order Status Update';
  const currentSubtitle = statusSubtitles[status] || '';

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; font-weight: 600; color: #1e293b;">${item.name}</td>
        <td style="padding: 12px; text-align: center; color: #64748b;">x${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #0f172a;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background-color: ${currentColor}; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 14px; }
        .content { padding: 32px 24px; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; color: #ffffff; background-color: ${currentColor}; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total-row { background: #f1f5f9; font-weight: 700; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${currentTitle}</h1>
          <p>${currentSubtitle}</p>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Here are the latest details regarding your order <strong>#${orderId}</strong>:</p>
          
          <div style="margin: 20px 0; padding: 12px 16px; background: #f8fafc; border-left: 4px solid ${currentColor}; border-radius: 4px;">
            Status: <span class="badge">${status}</span>
          </div>

          <table class="table">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; font-size: 13px; color: #475569;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2" style="padding: 14px; text-align: right; color: #0f172a;">Total Amount:</td>
                <td style="padding: 14px; text-align: right; color: #ef4444;">₹${totalPrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${
            status === 'Delivered'
              ? `
            <div style="text-align: center; margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
              <p style="font-weight: 700; color: #166534; margin: 0 0 4px 0;">Enjoy your items?</p>
              <p style="font-size: 13px; color: #15803d; margin: 0;">Log into your account anytime to leave a review!</p>
            </div>
          `
              : ''
          }
        </div>
        <div class="footer">
          <p>Thank you for shopping with ECOMMERCE!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
