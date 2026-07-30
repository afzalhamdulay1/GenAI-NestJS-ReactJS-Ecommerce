import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CouponsService } from '../coupons/coupons.service';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private couponsService: CouponsService,
  ) {}

  async getSettings(): Promise<SettingsDocument> {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({
        taxRate: 18,
        shippingFee: 200,
        freeShippingThreshold: 1000,
        isTaxEnabled: true,
        isShippingFeeEnabled: true,
      });
    }
    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    let settings = await this.getSettings();

    if (updateSettingsDto.taxRate !== undefined) settings.taxRate = updateSettingsDto.taxRate;
    if (updateSettingsDto.shippingFee !== undefined) settings.shippingFee = updateSettingsDto.shippingFee;
    if (updateSettingsDto.freeShippingThreshold !== undefined)
      settings.freeShippingThreshold = updateSettingsDto.freeShippingThreshold;
    if (updateSettingsDto.isTaxEnabled !== undefined) settings.isTaxEnabled = updateSettingsDto.isTaxEnabled;
    if (updateSettingsDto.isShippingFeeEnabled !== undefined)
      settings.isShippingFeeEnabled = updateSettingsDto.isShippingFeeEnabled;

    await settings.save();

    return {
      success: true,
      settings,
    };
  }

  async calculatePricing(items: OrderItemInput[], couponCode?: string) {
    if (!items || items.length === 0) {
      throw new BadRequestException('No order items provided');
    }

    const settings = await this.getSettings();

    // 1. Look up authoritative database product prices
    const productIds = items.map((item) => item.productId);
    const dbProducts = await this.productModel.find({ _id: { $in: productIds } });

    let subtotal = 0;
    const verifiedOrderItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p._id.toString() === item.productId);
      if (!dbProduct) {
        throw new BadRequestException(`Product with ID ${item.productId} not found`);
      }
      const price = dbProduct.price;
      subtotal += price * item.quantity;

      return {
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        image: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images[0].url : '',
        productId: dbProduct._id.toString(),
      };
    });

    // 2. Server-Side Discount Calculation
    let discount = 0;
    let verifiedCouponCode = '';
    if (couponCode && couponCode.trim()) {
      try {
        const couponResult = await this.couponsService.applyCoupon({
          code: couponCode.trim(),
          subtotal,
        });
        discount = couponResult.discountAmount || 0;
        verifiedCouponCode = couponResult.code;
      } catch (err) {
        // If coupon is invalid during checkout, discount remains 0
        discount = 0;
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // 3. Server-Side Shipping Charges
    let shippingPrice = 0;
    if (settings.isShippingFeeEnabled) {
      shippingPrice = subtotalAfterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    }

    // 4. Server-Side GST Calculation
    let taxPrice = 0;
    if (settings.isTaxEnabled && settings.taxRate > 0) {
      taxPrice = Math.round(subtotalAfterDiscount * (settings.taxRate / 100));
    }

    // 5. Authoritative Total Price
    const totalPrice = subtotalAfterDiscount + taxPrice + shippingPrice;

    return {
      subtotal,
      discount,
      couponCode: verifiedCouponCode,
      subtotalAfterDiscount,
      itemsPrice: subtotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      verifiedOrderItems,
      settings: {
        taxRate: settings.taxRate,
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
        isTaxEnabled: settings.isTaxEnabled,
        isShippingFeeEnabled: settings.isShippingFeeEnabled,
      },
    };
  }
}
