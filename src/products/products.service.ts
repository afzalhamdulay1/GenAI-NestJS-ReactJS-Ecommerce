import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiFeatures } from '../common/utils/api-features.util';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as cloudinary from 'cloudinary';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject('Cloudinary') private cloudinaryProvider: any,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createProduct(createProductDto: CreateProductDto, user: UserDocument) {
    let images: string[] = [];

    if (typeof createProductDto.images === 'string') {
      images.push(createProductDto.images);
    } else if (Array.isArray(createProductDto.images)) {
      images = createProductDto.images;
    }

    const imagesLinks = await Promise.all(
      images.map(async (img) => {
        const result = await cloudinary.v2.uploader.upload(img, {
          folder: 'products',
        });
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      })
    );

    const productData: any = {
      ...createProductDto,
      images: imagesLinks,
      user: user._id,
    };

    // Backend Safety Sanitization for Prices
    if (productData.price !== undefined) {
      productData.price = Math.max(0, Number(productData.price) || 0);
    }
    if (productData.originalPrice !== undefined) {
      productData.originalPrice = Math.max(0, Number(productData.originalPrice) || 0);
      if (productData.originalPrice <= productData.price) {
        productData.originalPrice = 0; // Strip invalid strikethrough if original is <= selling price
      }
    }

    if (productData.hasVariants === 'true' || productData.hasVariants === true) {
      productData.hasVariants = true;
      if (typeof productData.options === 'string') {
        productData.options = JSON.parse(productData.options);
      }
      if (typeof productData.variants === 'string') {
        productData.variants = JSON.parse(productData.variants);
      }
      if (Array.isArray(productData.variants) && productData.variants.length > 0) {
        productData.stock = productData.variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
      }
    } else {
      productData.hasVariants = false;
      productData.options = [];
      productData.variants = [];
    }

    const product = await this.productModel.create(productData as any);

    return {
      success: true,
      product,
    };
  }

  async getAllProducts(query: ProductQueryDto) {
    const resultPerPage = 8;
    const productsCount = await this.productModel.countDocuments();

    const apiFeature = new ApiFeatures(
      this.productModel
        .find()
        .select('name price originalPrice discountType ratings images category stock numOfReviews hasVariants options variants createdAt')
        .sort({ createdAt: -1 }), 
      query
    )
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

  async getTopSellingProducts() {
    // Aggregate total quantity sold per product across all orders
    const salesAggregation = await this.orderModel.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 8 },
    ]);

    const topProductIds = salesAggregation.map((s) => s._id);

    // Fetch product details for top selling product IDs
    const products = await this.productModel
      .find({ _id: { $in: topProductIds } })
      .select('name price originalPrice discountType ratings images category stock numOfReviews hasVariants options variants createdAt');

    // Maintain strict sort order based on aggregated units sold
    const sortedProducts = topProductIds
      .map((id) => products.find((p) => p._id.toString() === id.toString()))
      .filter(Boolean);

    // Fallback: If not enough orders yet, fill with highest rated products
    if (sortedProducts.length < 8) {
      const existingIds = new Set(sortedProducts.map((p: any) => p._id.toString()));
      const fallbackProducts = await this.productModel
        .find({ _id: { $nin: Array.from(existingIds) } })
        .select('name price originalPrice discountType ratings images category stock numOfReviews hasVariants options variants createdAt')
        .sort({ numOfReviews: -1, ratings: -1 })
        .limit(8 - sortedProducts.length);

      sortedProducts.push(...fallbackProducts as any);
    }

    return {
      success: true,
      products: sortedProducts,
    };
  }

  async getAdminProducts() {
    const products = await this.productModel.find().sort({ createdAt: -1 });
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

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    let product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Images Start Here
    let images: string[] = [];

    if (typeof updateProductDto.images === 'string') {
      images.push(updateProductDto.images);
    } else if (Array.isArray(updateProductDto.images)) {
      images = updateProductDto.images;
    }

    if (images !== undefined && images.length > 0) {
      // 1. Separate new base64 uploads from existing Cloudinary image URLs
      const newBase64Images: string[] = [];
      const existingUrls: string[] = [];

      images.forEach((img) => {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          newBase64Images.push(img);
        } else if (typeof img === 'string') {
          existingUrls.push(img);
        }
      });

      // 2. Identify existing images that were deleted by admin and destroy them on Cloudinary
      if (product.images && product.images.length > 0) {
        const keptPublicIds = new Set(
          product.images
            .filter((img) => existingUrls.includes(img.url))
            .map((img) => img.public_id)
        );

        const imagesToDestroy = product.images.filter(
          (img) => img.public_id && !keptPublicIds.has(img.public_id)
        );

        if (imagesToDestroy.length > 0) {
          await Promise.all(
            imagesToDestroy.map(async (img) => {
              try {
                if (img.public_id) {
                  await cloudinary.v2.uploader.destroy(img.public_id);
                }
              } catch (e) {
                // Ignore Cloudinary deletion errors for non-existent assets
              }
            })
          );
        }
      }

      // 3. Upload any new base64 images to Cloudinary
      const uploadedNewImages = await Promise.all(
        newBase64Images.map(async (img) => {
          const result = await cloudinary.v2.uploader.upload(img, {
            folder: 'products',
          });
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );

      // 4. Re-construct the final ordered images array preserving the exact arrangement
      let newUploadIndex = 0;
      const finalImages = images.map((img) => {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const uploaded = uploadedNewImages[newUploadIndex++];
          return uploaded;
        } else {
          // Find matching existing image object to keep public_id
          const existingObj = product?.images?.find((existing) => existing.url === img);
          return existingObj || { public_id: '', url: img };
        }
      });

      updateProductDto.images = finalImages as any;
    }

    const updateData: any = { ...updateProductDto };

    // Backend Safety Sanitization for Prices
    if (updateData.price !== undefined) {
      updateData.price = Math.max(0, Number(updateData.price) || 0);
    }
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = Math.max(0, Number(updateData.originalPrice) || 0);
      const targetPrice = updateData.price !== undefined ? updateData.price : product.price;
      if (updateData.originalPrice <= targetPrice) {
        updateData.originalPrice = 0; // Strip invalid strikethrough if original is <= selling price
      }
    }

    if (updateData.hasVariants !== undefined) {
      if (updateData.hasVariants === 'true' || updateData.hasVariants === true) {
        updateData.hasVariants = true;
        if (typeof updateData.options === 'string') {
          updateData.options = JSON.parse(updateData.options);
        }
        if (typeof updateData.variants === 'string') {
          updateData.variants = JSON.parse(updateData.variants);
        }
        if (Array.isArray(updateData.variants) && updateData.variants.length > 0) {
          updateData.stock = updateData.variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
        }
      } else {
        updateData.hasVariants = false;
        updateData.options = [];
        updateData.variants = [];
      }
    }

    Object.assign(product, updateData);
    if (updateData.hasVariants) {
      product.markModified('variants');
      product.markModified('options');
    }

    await product.save();

    await this.cacheManager.del('ai_store_executive_insights');
    await this.cacheManager.del('ai_store_executive_insights_v2');

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

    // Deleting Images From Cloudinary in parallel
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => cloudinary.v2.uploader.destroy(img.public_id))
      );
    }

    await product.deleteOne();

    await this.cacheManager.del('ai_store_executive_insights');

    return {
      success: true,
      message: 'Product Deleted Successfully',
    };
  }

  async createProductReview(createReviewDto: CreateReviewDto, user: UserDocument) {
    const { rating, comment, productId, images } = createReviewDto;

    const hasBought = await this.orderModel.exists({
      $or: [
        { user: user._id },
        { guestEmail: user.email },
      ],
      'orderItems.productId': productId,
    } as any);
    const isVerifiedPurchase = Boolean(hasBought);

    let photos: Array<{ public_id: string; url: string }> = [];
    if (images && images.length > 0) {
      photos = await Promise.all(
        images.map(async (img) => {
          const result = await cloudinary.v2.uploader.upload(img, {
            folder: 'reviews',
            resource_type: 'image',
          });
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        })
      );
    }

    const review = {
      user: user._id,
      name: user.name,
      rating: Number(rating),
      comment,
      photos,
      isVerifiedPurchase,
      createdAt: new Date(),
    };

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === user._id.toString()
    );

    if (isReviewed) {
      for (const rev of product.reviews) {
        if (rev.user.toString() === user._id.toString()) {
          rev.rating = Number(rating);
          rev.comment = comment;
          if (photos.length > 0) {
            // Asynchronous non-blocking Cloudinary cleanup for replaced photos
            if (rev.photos && rev.photos.length > 0) {
              this.deletePhotosInBackground(rev.photos);
            }
            rev.photos = photos;
          }
          rev.isVerifiedPurchase = isVerifiedPurchase;
        }
      }
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

    // Invalidate stale cache for AI review summary and product page
    await this.cacheManager.del(`ai_review_summary_${productId}`);

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

    // Find review to delete and clean up photos in background without blocking HTTP response
    const targetReview = product.reviews.find(
      (rev: any) => rev._id.toString() === id.toString()
    );

    if (targetReview && targetReview.photos && targetReview.photos.length > 0) {
      this.deletePhotosInBackground(targetReview.photos);
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

  /**
   * Fire-and-forget background cleanup for Cloudinary review photos
   */
  private deletePhotosInBackground(photos: Array<{ public_id: string }>) {
    if (!photos || photos.length === 0) return;
    Promise.all(
      photos.map(async (photo) => {
        if (photo.public_id) {
          try {
            await cloudinary.v2.uploader.destroy(photo.public_id);
          } catch (err) {
            console.error(`Failed to delete Cloudinary review photo ${photo.public_id}:`, err);
          }
        }
      })
    ).catch((err) => console.error('Cloudinary background cleanup error:', err));
  }
}
