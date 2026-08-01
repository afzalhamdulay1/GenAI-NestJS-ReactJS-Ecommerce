import PDFDocument = require('pdfkit');

export const generateInvoice = (order: any, user: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Brand
      doc
        .fillColor('#1e293b')
        .fontSize(22)
        .text('TAX INVOICE', 50, 50, { bold: true })
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Order ID: #${order._id?.toString().toUpperCase()}`, 200, 50, { align: 'right' })
        .text(`Date: ${new Date(order.paidAt || order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 200, 65, { align: 'right' })
        .text(`Status: ${order.orderStatus || 'Processing'}`, 200, 80, { align: 'right' });

      doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#e2e8f0').stroke();

      // Customer details
      doc
        .fontSize(12)
        .fillColor('#0f172a')
        .text('Billed To:', 50, 115)
        .fontSize(10)
        .fillColor('#334155')
        .text(`Customer Name: ${user.name || 'Valued Customer'}`, 50, 132)
        .text(`Email: ${user.email || 'N/A'}`, 50, 147)
        .text(`Phone: ${order.shippingInfo?.phoneNo || 'N/A'}`, 50, 162);

      if (order.shippingInfo) {
        const addr = `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`;
        doc.text(`Shipping Address: ${addr}`, 50, 177, { width: 480 });
      }

      // Table Header
      let y = 220;
      doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
      y += 10;

      doc
        .fontSize(11)
        .fillColor('#1e293b')
        .text('Item Description', 50, y)
        .text('Qty', 320, y, { width: 40, align: 'center' })
        .text('Unit Price', 380, y, { width: 70, align: 'right' })
        .text('Amount', 460, y, { width: 90, align: 'right' });

      y += 20;
      doc.moveTo(50, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
      y += 15;

      // Table rows
      order.orderItems.forEach((item: any) => {
        let variantStr = '';
        if (item.selectedVariant && Object.keys(item.selectedVariant).length > 0) {
          variantStr = ` (${Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(', ')})`;
        }

        doc
          .fontSize(10)
          .fillColor('#0f172a')
          .text(`${item.name}${variantStr}`, 50, y, { width: 260 })
          .text(item.quantity.toString(), 320, y, { width: 40, align: 'center' })
          .text(`INR ${item.price?.toLocaleString()}`, 380, y, { width: 70, align: 'right' })
          .text(`INR ${(item.price * item.quantity)?.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
        
        y += 25;
      });

      doc.moveTo(50, y).lineTo(550, y).strokeColor('#e2e8f0').stroke();
      y += 15;

      // Totals
      doc.fontSize(10).fillColor('#475569');

      doc.text('Subtotal:', 350, y, { width: 100, align: 'right' });
      doc.text(`INR ${order.itemsPrice?.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
      y += 18;

      if (order.taxPrice !== undefined && order.taxPrice > 0) {
        doc.text('GST / Tax:', 350, y, { width: 100, align: 'right' });
        doc.text(`INR ${order.taxPrice?.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
        y += 18;
      }

      if (order.shippingPrice !== undefined) {
        doc.text('Shipping Fee:', 350, y, { width: 100, align: 'right' });
        doc.text(order.shippingPrice === 0 ? 'FREE' : `INR ${order.shippingPrice?.toLocaleString()}`, 460, y, { width: 90, align: 'right' });
        y += 18;
      }

      doc.moveTo(350, y).lineTo(550, y).strokeColor('#cbd5e1').stroke();
      y += 10;

      doc
        .fontSize(13)
        .fillColor('#0f172a')
        .text('Grand Total:', 350, y, { width: 100, align: 'right' })
        .text(`INR ${order.totalPrice?.toLocaleString()}`, 460, y, { width: 90, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
