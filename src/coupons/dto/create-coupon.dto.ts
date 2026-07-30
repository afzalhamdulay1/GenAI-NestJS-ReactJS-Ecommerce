import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsDateString()
  expiresAt: string;
}
