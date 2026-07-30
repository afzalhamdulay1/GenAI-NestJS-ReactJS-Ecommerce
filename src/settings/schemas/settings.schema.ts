import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ default: 18 })
  taxRate: number; // GST percentage (e.g. 18)

  @Prop({ default: 200 })
  shippingFee: number; // Standard shipping fee in ₹

  @Prop({ default: 1000 })
  freeShippingThreshold: number; // Subtotal threshold for free shipping in ₹

  @Prop({ default: true })
  isTaxEnabled: boolean;

  @Prop({ default: true })
  isShippingFeeEnabled: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
