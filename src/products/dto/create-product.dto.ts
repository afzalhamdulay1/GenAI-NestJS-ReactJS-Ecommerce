import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter product name' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter product description' })
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  @IsNotEmpty({ message: 'Please enter product price' })
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Original price cannot be negative' })
  originalPrice?: number;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter product category' })
  category: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Please enter product stock' })
  stock: number;

  @IsOptional()
  images?: string | string[];

  @IsOptional()
  hasVariants?: boolean | string;

  @IsOptional()
  options?: any;

  @IsOptional()
  variants?: any;
}
