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
    },
  ])
  reviews: Array<{ user: mongoose.Schema.Types.ObjectId; name: string; rating: number; comment: string }>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
