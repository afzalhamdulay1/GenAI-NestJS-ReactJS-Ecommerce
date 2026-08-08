import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch (e) {
        return value.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
