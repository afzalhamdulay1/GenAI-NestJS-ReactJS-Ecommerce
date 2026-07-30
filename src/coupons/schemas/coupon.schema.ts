import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0, min: 0 })
  minAmount: number;

  @Prop({ default: null })
  maxDiscount?: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
