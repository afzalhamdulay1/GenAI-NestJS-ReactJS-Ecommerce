import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  freeShippingThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isTaxEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isShippingFeeEnabled?: boolean;
}
