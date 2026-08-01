import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Response } from 'express';
import { ProductsService } from '../products/products.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { generateInvoice } from '../common/utils/generate-invoice.util';
import { generateOrderStatusHtml } from '../common/utils/order-email-template.util';
import { ProductDocument, Product } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private paymentsService: PaymentsService,
    private settingsService: SettingsService,
    private configService: ConfigService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user?: UserDocument) {
    const orderItemsInput = createOrderDto.orderItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const pricing = await this.settingsService.calculatePricing(
      orderItemsInput,
      (createOrderDto as any).couponCode,
    );

    let isGuest = false;
    let guestEmail: string | undefined = undefined;
    let guestAccessToken: string | undefined = undefined;
    let matchedUserId: any = undefined;

    if (!user) {
      if (!createOrderDto.guestEmail) {
        throw new BadRequestException('Email address is required for guest checkout');
      }
      isGuest = true;
      guestEmail = createOrderDto.guestEmail;
      guestAccessToken = crypto.randomBytes(32).toString('hex');

      // Auto-link to existing registered account if email matches
      const existingUser = await this.userModel.findOne({ email: guestEmail.toLowerCase().trim() });
      if (existingUser) {
        matchedUserId = existingUser._id;
      }
    }

    const orderData: any = {
      ...(createOrderDto as any),
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      totalPrice: pricing.totalPrice,
      orderItems: pricing.verifiedOrderItems,
      paidAt: Date.now(),
      isGuest,
    };

    if (user) {
      orderData.user = user._id;
    } else {
      if (matchedUserId) {
        orderData.user = matchedUserId;
      }
      orderData.guestEmail = guestEmail;
      orderData.guestAccessToken = guestAccessToken;
    }

    const order = await this.orderModel.create(orderData);

    const customerName = user?.name || createOrderDto.guestName || 'Valued Customer';
    const customerEmail = user?.email || guestEmail || '';

    const invoiceBuffer = await generateInvoice(order, user || { name: customerName, email: customerEmail });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const trackingLink = isGuest 
      ? `${frontendUrl}/order/guest/${order._id}?token=${guestAccessToken}`
      : `${frontendUrl}/order/${order._id}`;

    const htmlContent = generateOrderStatusHtml({
      status: 'Processing',
      userName: customerName,
      orderId: (order as any)._id.toString(),
      items: order.orderItems,
      totalPrice: order.totalPrice,
    });

    // Send order confirmation email asynchronously in background so customer checkout returns instantly (<50ms)
    if (customerEmail) {
      this.mailService
        .sendEmail({
          email: customerEmail,
          subject: `🛍️ Order Confirmation - #${(order as any)._id}`,
          message: `Hi ${customerName},\n\nThank you for placing an order with us! Your order #${(order as any)._id} has been successfully placed.\n\nTrack your order here: ${trackingLink}\n\nPlease find your invoice attached.\n\nHappy Shopping!`,
          html: `${htmlContent}<p style="text-align:center; margin-top:20px;"><a href="${trackingLink}" style="background-color:#6366f1; color:white; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Track Order Live</a></p>`,
          attachments: [
            {
              filename: `Invoice_${(order as any)._id}.pdf`,
              content: invoiceBuffer,
              contentType: 'application/pdf',
            },
          ],
        })
        .catch((error) => {
          console.error('Error sending order confirmation email:', error);
        });
    }

    return {
      success: true,
      order,
      guestAccessToken,
    };
  }

  async getSingleOrder(id: string) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return {
      success: true,
      order,
    };
  }

  async getGuestOrder(id: string, token: string) {
    const order = await this.orderModel.findById(id);

    if (!order || !order.guestAccessToken || order.guestAccessToken !== token) {
      throw new NotFoundException('Invalid guest order tracking link or token expired');
    }

    return {
      success: true,
      order,
    };
  }

  async downloadInvoice(id: string, user: UserDocument, res: Response) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderUserId = (order.user as any)?._id?.toString() || order.user?.toString();

    if (user.role !== 'admin' && orderUserId !== user._id.toString()) {
      throw new BadRequestException('You do not have permission to access this invoice');
    }

    const invoiceBuffer = await generateInvoice(order, order.user || user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${order._id}.pdf`,
      'Content-Length': invoiceBuffer.length,
    });

    res.send(invoiceBuffer);
  }

  async downloadGuestInvoice(id: string, token: string, res: Response) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');

    if (!order || !order.guestAccessToken || order.guestAccessToken !== token) {
      throw new NotFoundException('Invalid guest order token');
    }

    const customerName = (order.user as any)?.name || order.guestName || 'Guest Customer';
    const customerEmail = (order.user as any)?.email || order.guestEmail || '';

    const invoiceBuffer = await generateInvoice(order, order.user || { name: customerName, email: customerEmail });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${order._id}.pdf`,
      'Content-Length': invoiceBuffer.length,
    });

    res.send(invoiceBuffer);
  }

  async myOrders(user: UserDocument) {
    const orders = await this.orderModel.find({ user: user._id as any }).sort({ createdAt: -1 });
    return {
      success: true,
      orders,
    };
  }

  // Admin Routes
  async getAllOrders() {
    const orders = await this.orderModel
      .find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let totalAmount = 0;

    orders.forEach((order) => {
      if (order.orderStatus !== 'Cancelled') {
        totalAmount += order.totalPrice;
      }
    });

    return {
      success: true,
      totalAmount,
      orders,
    };
  }

  async updateOrder(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(id).populate('user', 'name email');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus === 'Delivered') {
      throw new BadRequestException('You have already delivered this order');
    }

    if (order.orderStatus === 'Cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (!updateOrderStatusDto.status) {
      throw new BadRequestException('Status field is required');
    }

    // Deduct stock only when order ships
    if (order.orderStatus === 'Processing' && updateOrderStatusDto.status === 'Shipped') {
      for (const item of order.orderItems) {
        await this.updateStock(item.productId.toString(), item.quantity, item.selectedVariant, 'deduct');
      }
    }

    // Restore stock if a shipped order is cancelled
    if (order.orderStatus === 'Shipped' && updateOrderStatusDto.status === 'Cancelled') {
      for (const item of order.orderItems) {
        await this.updateStock(item.productId.toString(), item.quantity, item.selectedVariant, 'restore');
      }
    }

    order.orderStatus = updateOrderStatusDto.status;

    if (updateOrderStatusDto.status === 'Shipped') {
      order.trackingInfo = {
        courierName: updateOrderStatusDto.courierName || order.trackingInfo?.courierName,
        trackingNumber: updateOrderStatusDto.trackingNumber || order.trackingInfo?.trackingNumber,
        trackingUrl: updateOrderStatusDto.trackingUrl || order.trackingInfo?.trackingUrl,
        shippedAt: order.trackingInfo?.shippedAt || new Date(),
        estimatedDelivery: updateOrderStatusDto.estimatedDelivery 
          ? new Date(updateOrderStatusDto.estimatedDelivery) 
          : order.trackingInfo?.estimatedDelivery,
      };
    }
    
    if (updateOrderStatusDto.status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save({ validateBeforeSave: false });

    // Handle Stripe Refund if Admin cancelled a paid order
    if (updateOrderStatusDto.status === 'Cancelled' && order.paymentInfo && order.paymentInfo.id) {
      try {
        await this.paymentsService.refundPayment(order.paymentInfo.id);
      } catch (error) {
        console.error('Failed to process refund (admin):', error);
      }
    }

    const recipientEmail = (order.user as any)?.email || order.guestEmail;
    const recipientName = (order.user as any)?.name || 'Valued Customer';

    // Send email asynchronously in background so HTTP response returns instantly (<50ms)
    if (recipientEmail) {
      const statusSubjects: Record<string, string> = {
        Shipped: `🚚 Your Order #${(order as any)._id} Has Shipped!`,
        Delivered: `🎉 Order #${(order as any)._id} Delivered!`,
        Cancelled: `❌ Order #${(order as any)._id} Cancelled`,
      };

      const subject = statusSubjects[updateOrderStatusDto.status] || `Order Update - #${(order as any)._id}`;
      const htmlContent = generateOrderStatusHtml({
        status: updateOrderStatusDto.status as any,
        userName: recipientName,
        orderId: (order as any)._id.toString(),
        items: order.orderItems,
        totalPrice: order.totalPrice,
      });

      this.mailService
        .sendEmail({
          email: recipientEmail,
          subject,
          message: `Hi ${recipientName},\n\nYour order #${(order as any)._id} status has been updated to: ${updateOrderStatusDto.status}.`,
          html: htmlContent,
        })
        .catch((error) => {
          console.error(`Error sending order ${updateOrderStatusDto.status} email (admin):`, error);
        });
    }

    return {
      success: true,
    };
  }

  private async updateStock(
    productId: string, 
    quantity: number, 
    selectedVariant?: Record<string, string>,
    action: 'deduct' | 'restore' = 'deduct'
  ) {
    const product = await this.productModel.findById(productId);
    if (!product) return;

    if (product.hasVariants && Array.isArray(product.variants) && selectedVariant && Object.keys(selectedVariant).length > 0) {
      const variantIndex = product.variants.findIndex((v) => {
        const attrs = v.attributes || {};
        return Object.keys(selectedVariant).every((key) => attrs[key] === selectedVariant[key]);
      });

      if (variantIndex !== -1) {
        const currentVariantStock = product.variants[variantIndex].stock || 0;
        const newVariantStock = action === 'deduct' 
          ? Math.max(0, currentVariantStock - quantity)
          : currentVariantStock + quantity;

        product.variants[variantIndex].stock = newVariantStock;
        product.stock = product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
        await product.save({ validateBeforeSave: false });
        return;
      }
    }

    // Atomic update for simple non-variant product stock
    if (action === 'deduct') {
      await this.productModel.updateOne(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
    } else {
      await this.productModel.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      );
    }
  }

  async cancelMyOrder(id: string, user: UserDocument) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.user || order.user.toString() !== user._id.toString()) {
      throw new BadRequestException('You do not have permission to cancel this order');
    }

    if (order.orderStatus !== 'Processing') {
      throw new BadRequestException('You cannot cancel this order at its current stage');
    }

    order.orderStatus = 'Cancelled';
    await order.save({ validateBeforeSave: false });

    if (order.paymentInfo && order.paymentInfo.id) {
      try {
        await this.paymentsService.refundPayment(order.paymentInfo.id);
      } catch (error) {
        console.error('Failed to process refund:', error);
      }
    }

    const htmlContent = generateOrderStatusHtml({
      status: 'Cancelled',
      userName: user.name,
      orderId: (order as any)._id.toString(),
      items: order.orderItems,
      totalPrice: order.totalPrice,
    });

    this.mailService
      .sendEmail({
        email: user.email,
        subject: `❌ Order Cancelled - #${(order as any)._id}`,
        message: `Hi ${user.name},\n\nYour order #${(order as any)._id} has been successfully cancelled.`,
        html: htmlContent,
      })
      .catch((error) => {
        console.error('Error sending order cancellation email:', error);
      });

    return {
      success: true,
      message: `Order cancelled successfully. Your refund of ₹${order.totalPrice?.toLocaleString()} is being processed and will be credited to your account within 3-5 business days.`,
    };
  }

  async cancelGuestOrder(id: string, token: string) {
    const order = await this.orderModel.findById(id);

    if (!order || !order.guestAccessToken || order.guestAccessToken !== token) {
      throw new NotFoundException('Invalid guest order token');
    }

    if (order.orderStatus !== 'Processing') {
      throw new BadRequestException('You cannot cancel this order at its current stage');
    }

    order.orderStatus = 'Cancelled';
    await order.save({ validateBeforeSave: false });

    if (order.paymentInfo && order.paymentInfo.id) {
      try {
        await this.paymentsService.refundPayment(order.paymentInfo.id);
      } catch (error) {
        console.error('Failed to process refund (guest):', error);
      }
    }

    if (order.guestEmail) {
      const htmlContent = generateOrderStatusHtml({
        status: 'Cancelled',
        userName: 'Valued Customer',
        orderId: (order as any)._id.toString(),
        items: order.orderItems,
        totalPrice: order.totalPrice,
      });

      this.mailService
        .sendEmail({
          email: order.guestEmail,
          subject: `❌ Order Cancelled - #${(order as any)._id}`,
          message: `Hi Valued Customer,\n\nYour guest order #${(order as any)._id} has been successfully cancelled.`,
          html: htmlContent,
        })
        .catch((error) => {
          console.error('Error sending guest order cancellation email:', error);
        });
    }

    return {
      success: true,
      message: `Order cancelled successfully. Your refund of ₹${order.totalPrice?.toLocaleString()} is being processed and will be credited to your account within 3-5 business days.`,
    };
  }

  async deleteOrder(id: string) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await order.deleteOne();

    return {
      success: true,
    };
  }
}
