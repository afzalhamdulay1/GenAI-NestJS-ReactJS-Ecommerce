import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsObject()
  @IsNotEmpty()
  shippingInfo: any;

  @IsArray()
  @IsNotEmpty()
  orderItems: any[];

  @IsObject()
  @IsNotEmpty()
  paymentInfo: any;

  @IsNumber()
  @IsNotEmpty()
  itemsPrice: number;

  @IsNumber()
  @IsNotEmpty()
  taxPrice: number;

  @IsNumber()
  @IsNotEmpty()
  shippingPrice: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}
