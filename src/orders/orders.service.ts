import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';
import { generateInvoice } from '../common/utils/generate-invoice.util';
import { ProductDocument, Product } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>, // We should inject model directly for stock update
    private mailService: MailService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, user: any) {
    const order = await this.orderModel.create({
      ...createOrderDto,
      paidAt: Date.now(),
      user: user._id,
    });

    const invoiceBuffer = await generateInvoice(order, user);

    try {
      await this.mailService.sendEmail({
        email: user.email,
        subject: `Order Confirmation - #${order._id}`,
        message: `Hi ${user.name},\n\nThank you for placing an order with us! Your order #${order._id} has been successfully placed. Please find your invoice attached.\n\nHappy Shopping!`,
        attachments: [
          {
            filename: `Invoice_${order._id}.pdf`,
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

  async myOrders(user: any) {
    const orders = await this.orderModel.find({ user: user._id });
    return {
      success: true,
      orders,
    };
  }

  // Admin Routes
  async getAllOrders() {
    const orders = await this.orderModel.find().populate('user', 'name email');

    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    return {
      success: true,
      totalAmount,
      orders,
    };
  }

  async updateOrder(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus === 'Delivered') {
      throw new BadRequestException('You have already delivered this order');
    }

    if (!updateData.status) {
      throw new BadRequestException('Status field is required');
    }

    for (const item of order.orderItems) {
      await this.updateStock(item.productId.toString(), item.quantity);
    }

    order.orderStatus = updateData.status;
    
    if (updateData.status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save({ validateBeforeSave: false });

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
