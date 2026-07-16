import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter product name' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter product description' })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Please enter product price' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Please enter product category' })
  category: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Please enter product stock' })
  stock: number;

  @IsOptional()
  images?: string | string[];
}
