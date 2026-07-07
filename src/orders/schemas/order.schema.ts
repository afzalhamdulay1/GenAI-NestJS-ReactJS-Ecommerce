import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pinCode: { type: Number, required: true },
      phoneNo: { type: Number, required: true },
    },
    required: true,
  })
  shippingInfo: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
    phoneNo: number;
  };

  @Prop([
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    },
  ])
  orderItems: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
    productId: mongoose.Schema.Types.ObjectId;
  }>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: {
      id: { type: String, required: true },
      status: { type: String, required: true },
    },
    required: true,
  })
  paymentInfo: {
    id: string;
    status: string;
  };

  @Prop({ required: true })
  paidAt: Date;

  @Prop({ required: true, default: 0.0 })
  itemsPrice: number;

  @Prop({ required: true, default: 0.0 })
  taxPrice: number;

  @Prop({ required: true, default: 0.0 })
  shippingPrice: number;

  @Prop({ required: true, default: 0.0 })
  totalPrice: number;

  @Prop({ required: true, default: 'Processing' })
  orderStatus: string;

  @Prop()
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
