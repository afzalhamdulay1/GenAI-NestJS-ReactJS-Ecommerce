import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { UserDocument } from '../users/schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { generateInvoice } from '../common/utils/generate-invoice.util';
import { generateOrderStatusHtml } from '../common/utils/order-email-template.util';
import { ProductDocument, Product } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>, // We should inject model directly for stock update
    private mailService: MailService,
    private paymentsService: PaymentsService,
    private settingsService: SettingsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: UserDocument) {
    const orderItemsInput = createOrderDto.orderItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const pricing = await this.settingsService.calculatePricing(
      orderItemsInput,
      (createOrderDto as any).couponCode,
    );

    const order = await this.orderModel.create({
      ...(createOrderDto as any),
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      totalPrice: pricing.totalPrice,
      orderItems: pricing.verifiedOrderItems,
      paidAt: Date.now(),
      user: user._id as any,
    });

    const invoiceBuffer = await generateInvoice(order, user);

    const htmlContent = generateOrderStatusHtml({
      status: 'Processing',
      userName: user.name,
      orderId: (order as any)._id.toString(),
      items: order.orderItems,
      totalPrice: order.totalPrice,
    });

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: `🛍️ Order Confirmation - #${(order as any)._id}`,
        message: `Hi ${user.name},\n\nThank you for placing an order with us! Your order #${(order as any)._id} has been successfully placed. Please find your invoice attached.\n\nHappy Shopping!`,
        html: htmlContent,
        attachments: [
          {
            filename: `Invoice_${(order as any)._id}.pdf`,
            content: invoiceBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }

    return {
      success: true,
      order,
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

  async myOrders(user: UserDocument) {
    const orders = await this.orderModel.find({ user: user._id as any }).sort({ createdAt: -1 });
    return {
      success: true,
      orders,
    };
  }

  // Admin Routes
  async getAllOrders() {
    const orders = await this.orderModel.find().populate('user', 'name email').sort({ createdAt: -1 });

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
        await this.updateStock(item.productId.toString(), item.quantity);
      }
    }

    // Restore stock if a shipped order is cancelled
    if (order.orderStatus === 'Shipped' && updateOrderStatusDto.status === 'Cancelled') {
      for (const item of order.orderItems) {
        await this.updateStock(item.productId.toString(), -item.quantity);
      }
    }

    order.orderStatus = updateOrderStatusDto.status;
    
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

    // Send automated status update email to customer for ALL status updates
    if (order.user) {
      const userObj = order.user as any;
      const statusSubjects: Record<string, string> = {
        Shipped: `🚚 Your Order #${(order as any)._id} Has Shipped!`,
        Delivered: `🎉 Order #${(order as any)._id} Delivered!`,
        Cancelled: `❌ Order #${(order as any)._id} Cancelled`,
      };

      const subject = statusSubjects[updateOrderStatusDto.status] || `Order Update - #${(order as any)._id}`;
      const htmlContent = generateOrderStatusHtml({
        status: updateOrderStatusDto.status as any,
        userName: userObj.name || 'Customer',
        orderId: (order as any)._id.toString(),
        items: order.orderItems,
        totalPrice: order.totalPrice,
      });

      try {
        await this.mailService.sendEmail({
          email: userObj.email,
          subject,
          message: `Hi ${userObj.name},\n\nYour order #${(order as any)._id} status has been updated to: ${updateOrderStatusDto.status}.`,
          html: htmlContent,
        });
      } catch (error) {
        console.error(`Error sending order ${updateOrderStatusDto.status} email (admin):`, error);
      }
    }

    return {
      success: true,
    };
  }

  private async updateStock(productId: string, quantity: number) {
    const product = await this.productModel.findById(productId);
    if (product) {
      product.stock -= quantity;
      await product.save({ validateBeforeSave: false });
    }
  }

  async cancelMyOrder(id: string, user: UserDocument) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== user._id.toString()) {
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

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: `❌ Order Cancelled - #${(order as any)._id}`,
        message: `Hi ${user.name},\n\nYour order #${(order as any)._id} has been successfully cancelled. If you have any questions, please contact our support team.`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending order cancellation email:', error);
    }

    return {
      success: true,
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
