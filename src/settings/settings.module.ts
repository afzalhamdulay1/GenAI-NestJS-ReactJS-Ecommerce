import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    CouponsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
