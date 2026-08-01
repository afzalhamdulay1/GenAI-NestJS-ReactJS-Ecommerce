import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, maxlength: 8 })
  price: number;

  @Prop({ maxlength: 8 })
  originalPrice?: number;

  @Prop({ default: 'percentage' })
  discountType?: string;

  @Prop({ default: 0 })
  ratings: number;

  @Prop([
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ])
  images: Array<{ public_id: string; url: string }>;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, maxlength: 4, default: 1 })
  stock: number;

  @Prop({ default: 0 })
  numOfReviews: number;

  @Prop([
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      photos: [
        {
          public_id: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      isVerifiedPurchase: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  reviews: Array<{
    user: mongoose.Schema.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    photos?: Array<{ public_id: string; url: string }>;
    isVerifiedPurchase?: boolean;
    createdAt?: Date;
  }>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false })
  hasVariants: boolean;

  @Prop([
    {
      name: { type: String, required: true },
      values: [{ type: String, required: true }],
    },
  ])
  options: Array<{ name: string; values: string[] }>;

  @Prop([
    {
      attributes: { type: Object, required: true },
      stock: { type: Number, required: true, default: 0 },
      price: { type: Number },
      originalPrice: { type: Number },
      sku: { type: String },
    },
  ])
  variants: Array<{
    attributes: Record<string, string>;
    stock: number;
    price?: number;
    originalPrice?: number;
    sku?: string;
  }>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index(
  {
    name: 'text',
    category: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 10,
      category: 5,
      description: 1,
    },
    name: 'ProductTextIndex',
  },
);
