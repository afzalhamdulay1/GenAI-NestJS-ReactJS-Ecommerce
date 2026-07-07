import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiFeatures } from '../common/utils/api-features.util';
import * as cloudinary from 'cloudinary';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject('Cloudinary') private cloudinaryProvider: any,
  ) {}

  async createProduct(createProductDto: CreateProductDto, user: any) {
    let images: any[] = [];

    if (typeof createProductDto.images === 'string') {
      images.push(createProductDto.images);
    } else if (Array.isArray(createProductDto.images)) {
      images = createProductDto.images;
    }

    const imagesLinks: any[] = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: 'products',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const productData = {
      ...createProductDto,
      images: imagesLinks,
      user: user.id,
    };

    const product = await this.productModel.create(productData);

    return {
      success: true,
      product,
    };
  }

  async getAllProducts(query: any) {
    const resultPerPage = 8;
    const productsCount = await this.productModel.countDocuments();

    const apiFeature = new ApiFeatures(this.productModel.find(), query)
      .search()
      .filter();

    const filteredProductsCount = await apiFeature.query.clone().countDocuments();

    apiFeature.pagination(resultPerPage);
    const products = await apiFeature.query;

    return {
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    };
  }

  async getAdminProducts() {
    const products = await this.productModel.find();
    return {
      success: true,
      products,
    };
  }

  async getProductDetails(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      product,
    };
  }

  async updateProduct(id: string, updateProductDto: any) {
    let product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Handle Images update here if needed
    let images: any[] = [];
    if (typeof updateProductDto.images === 'string') {
      images.push(updateProductDto.images);
    } else if (Array.isArray(updateProductDto.images)) {
      images = updateProductDto.images;
    }

    if (images !== undefined && images.length > 0) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      const imagesLinks: any[] = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: 'products',
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      updateProductDto.images = imagesLinks;
    } else {
        delete updateProductDto.images;
    }

    product = await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      returnDocument: 'after',
      runValidators: true,
      useFindAndModify: false,
    });

    return {
      success: true,
      product,
    };
  }

  async deleteProduct(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    return {
      success: true,
      message: 'Product Deleted Successfully',
    };
  }

  async createProductReview(createReviewDto: CreateReviewDto, user: any) {
    const { rating, comment, productId } = createReviewDto;

    const review = {
      user: user._id,
      name: user.name,
      rating: Number(rating),
      comment,
    };

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review as any);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    return {
      success: true,
    };
  }

  async getProductReviews(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      reviews: product.reviews,
    };
  }

  async deleteReview(productId: string, id: string) {
    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const reviews = product.reviews.filter(
      (rev: any) => rev._id.toString() !== id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    let ratings = 0;
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await this.productModel.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        returnDocument: 'after',
        runValidators: true,
        useFindAndModify: false,
      }
    );

    return {
      success: true,
    };
  }
}
