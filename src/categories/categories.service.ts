import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getAllCategories() {
    const categories = await this.categoryModel.find().sort({ name: 1 }).lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productsCount = await this.productModel.countDocuments({
          category: cat.name,
        });
        return {
          ...cat,
          productsCount,
        };
      })
    );

    return {
      success: true,
      categories: categoriesWithCount,
    };
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await this.categoryModel.findOne({
      $or: [{ name }, { slug }],
    });

    if (existing) {
      throw new BadRequestException('Category name already exists');
    }

    const category = await this.categoryModel.create({
      name,
      slug,
      description: createCategoryDto.description || `${name} category`,
    });

    return {
      success: true,
      category,
    };
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name) {
      const name = updateCategoryDto.name.trim();
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const existing = await this.categoryModel.findOne({
        _id: { $ne: id },
        $or: [{ name }, { slug }],
      });

      if (existing) {
        throw new BadRequestException('Category name already exists');
      }

      // If category name changes, also update products assigned to old category name
      const oldName = category.name;
      category.name = name;
      category.slug = slug;
      await this.productModel.updateMany({ category: oldName }, { category: name });
    }

    if (updateCategoryDto.description !== undefined) {
      category.description = updateCategoryDto.description;
    }

    await category.save();

    return {
      success: true,
      category,
    };
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Safety check: Don't allow deletion if products are assigned
    const assignedProductsCount = await this.productModel.countDocuments({
      category: category.name,
    });

    if (assignedProductsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because ${assignedProductsCount} active product(s) are assigned to it.`
      );
    }

    await category.deleteOne();

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
