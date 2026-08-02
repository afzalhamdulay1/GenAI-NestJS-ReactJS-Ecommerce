import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  async getAllProducts(@Query() query: ProductQueryDto) {
    return this.productsService.getAllProducts(query);
  }

  @Get('products/top-selling')
  async getTopSellingProducts() {
    return this.productsService.getTopSellingProducts();
  }

  @Get('product/:id')
  async getProductDetails(@Param('id') id: string) {
    return this.productsService.getProductDetails(id);
  }

  @Put('review')
  @UseGuards(JwtAuthGuard)
  async createProductReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.productsService.createProductReview(createReviewDto, user);
  }

  @Get('reviews')
  async getProductReviews(@Query('id') id: string) {
    return this.productsService.getProductReviews(id);
  }

  @Delete('reviews')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Query('productId') productId: string,
    @Query('id') id: string,
  ) {
    return this.productsService.deleteReview(productId, id);
  }

  // Admin Routes
  @Post('admin/product/new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fieldSize: 50 * 1024 * 1024 } }))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.productsService.createProduct(createProductDto, user);
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminProducts() {
    return this.productsService.getAdminProducts();
  }

  @Put('admin/product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fieldSize: 50 * 1024 * 1024 } }))
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete('admin/product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
