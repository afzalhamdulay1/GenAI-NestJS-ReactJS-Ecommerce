import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ConfigModule,
    forwardRef(() => AuthModule),
    CloudinaryModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
