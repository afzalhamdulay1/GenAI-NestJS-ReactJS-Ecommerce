import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  'price[gte]'?: string;

  @IsOptional()
  @IsString()
  'price[lte]'?: string;

  @IsOptional()
  @IsString()
  'ratings[gte]'?: string;
}
