import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductChunkDocument = ProductChunk & Document;

@Schema({ collection: 'product_chunks', timestamps: true })
export class ProductChunk {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  chunkIndex: number;

  @Prop({ required: true })
  chunkText: string;

  @Prop({ type: [Number], default: [] })
  embedding: number[];

  @Prop({ type: [Number], default: [] })
  localEmbedding: number[];
}

export const ProductChunkSchema = SchemaFactory.createForClass(ProductChunk);
