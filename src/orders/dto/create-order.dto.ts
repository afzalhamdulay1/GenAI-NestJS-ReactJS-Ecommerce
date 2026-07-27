import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';

export class ShippingInfoDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pinCode: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  phoneNo: number;
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class PaymentInfoDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class CreateOrderDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shippingInfo: ShippingInfoDto;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  paymentInfo: PaymentInfoDto;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  itemsPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  taxPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  shippingPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  totalPrice: number;
}
