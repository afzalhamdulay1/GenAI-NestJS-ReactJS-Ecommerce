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

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('E-Commerce Invoice', 50, 57)
        .fontSize(10)
        .text(`Order ID: ${order._id}`, 200, 50, { align: 'right' })
        .text(`Date: ${new Date(order.paidAt).toLocaleDateString()}`, 200, 65, { align: 'right' })
        .moveDown();

      // Customer details
      doc
        .text(`Customer: ${user.name}`, 50, 100)
        .text(`Email: ${user.email}`, 50, 115)
        .text(
          `Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.country}, ${order.shippingInfo.pinCode}`,
          50,
          130,
        )
        .moveDown();

      // Table Header
      let y = 170;
      doc
        .fontSize(12)
        .text('Item', 50, y)
        .text('Quantity', 250, y)
        .text('Price', 350, y)
        .text('Total', 450, y)
        .moveDown();

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

      y += 25;

      // Table rows
      order.orderItems.forEach((item: any) => {
        doc
          .fontSize(10)
          .text(item.name, 50, y)
          .text(item.quantity.toString(), 250, y)
          .text(`$${item.price}`, 350, y)
          .text(`$${item.price * item.quantity}`, 450, y);
        y += 20;
      });

      doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();

      // Totals
      y += 20;
      doc.text(`Subtotal: $${order.itemsPrice}`, 350, y);
      y += 15;
      doc.text(`Tax: $${order.taxPrice}`, 350, y);
      y += 15;
      doc.text(`Shipping: $${order.shippingPrice}`, 350, y);
      y += 20;
      doc.fontSize(14).text(`Total: $${order.totalPrice}`, 350, y);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
