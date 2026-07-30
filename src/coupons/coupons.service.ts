import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async createCoupon(createCouponDto: CreateCouponDto) {
    const existing = await this.couponModel.findOne({
      code: createCouponDto.code.toUpperCase().trim(),
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = await this.couponModel.create({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase().trim(),
    });

    return {
      success: true,
      coupon,
    };
  }

  async getAllCoupons() {
    const coupons = await this.couponModel.find().sort({ createdAt: -1 });
    return {
      success: true,
      coupons,
    };
  }

  async deleteCoupon(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await coupon.deleteOne();

    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  async applyCoupon(applyCouponDto: ApplyCouponDto) {
    const code = applyCouponDto.code.toUpperCase().trim();
    const coupon = await this.couponModel.findOne({ code });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive promo code');
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('This promo code has expired');
    }

    if (applyCouponDto.subtotal < coupon.minAmount) {
      throw new BadRequestException(
        `Minimum order subtotal of ₹${coupon.minAmount} is required for this coupon`,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (applyCouponDto.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed subtotal
    if (discountAmount > applyCouponDto.subtotal) {
      discountAmount = applyCouponDto.subtotal;
    }

    return {
      success: true,
      discountAmount: Math.round(discountAmount),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };
  }
}
