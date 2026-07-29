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
import { ProductDocument, Product } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>, // We should inject model directly for stock update
    private mailService: MailService,
    private paymentsService: PaymentsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: UserDocument) {
    const order = await this.orderModel.create({
      ...(createOrderDto as any),
      paidAt: Date.now(),
      user: user._id as any,
    });

    const invoiceBuffer = await generateInvoice(order, user);

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: `Order Confirmation - #${(order as any)._id}`,
        message: `Hi ${user.name},\n\nThank you for placing an order with us! Your order #${(order as any)._id} has been successfully placed. Please find your invoice attached.\n\nHappy Shopping!`,
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

    // Send Cancellation Email if Admin cancelled it
    if (updateOrderStatusDto.status === 'Cancelled' && order.user) {
      if (order.paymentInfo && order.paymentInfo.id) {
        try {
          await this.paymentsService.refundPayment(order.paymentInfo.id);
        } catch (error) {
          console.error('Failed to process refund (admin):', error);
          // depending on requirements, we might not want to block the DB update if refund fails, or maybe we do.
          // For now, let's log it.
        }
      }

      try {
        await this.mailService.sendEmail({
          email: (order.user as any).email,
          subject: `Order Cancelled - #${(order as any)._id}`,
          message: `Hi ${(order.user as any).name},\n\nYour order #${(order as any)._id} has been cancelled by our administration team. If you have any questions, please contact support.`,
        });
      } catch (error) {
        console.error('Error sending order cancellation email (admin):', error);
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

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: `Order Cancelled - #${(order as any)._id}`,
        message: `Hi ${user.name},\n\nYour order #${(order as any)._id} has been successfully cancelled. If you have any questions, please contact our support team.`,
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
