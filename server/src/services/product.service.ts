import { prisma } from '../config/database';
import { Product, ProductImage } from '@prisma/client';
import { ProductFilters } from '../types';
import { getPublicImageUrl } from '../utils/fileHelpers';

export type ProductWithImages = Product & {
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
};

export class ProductService {
  private formatProduct(product: ProductWithImages) {
    return {
      ...product,
      images: product.images
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(img => ({
          ...img,
          url: getPublicImageUrl(img.filePath),
          thumbUrl: getPublicImageUrl(img.thumbPath),
        })),
    };
  }

  async getPublished(filters: ProductFilters = {}) {
    const { categorySlug, search, isFeatured, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { modelCode: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: true, category: { select: { id: true, name: true, slug: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map(p => this.formatProduct(p as ProductWithImages)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBySlug(slug: string, publishedOnly = true): Promise<ReturnType<typeof this.formatProduct> | null> {
    const product = await prisma.product.findFirst({
      where: { slug, ...(publishedOnly ? { isPublished: true } : {}) },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });
    if (!product) return null;
    return this.formatProduct(product as ProductWithImages);
  }

  async getById(id: string): Promise<ReturnType<typeof this.formatProduct> | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });
    return product ? this.formatProduct(product as ProductWithImages) : null;
  }

  async getAll(filters: ProductFilters = {}) {
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { modelCode: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: true, category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: items.map(p => this.formatProduct(p as ProductWithImages)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: {
    name: string;
    modelCode: string;
    slug: string;
    categoryId: string;
    description?: string;
    material?: string;
    length?: number;
    width?: number;
    height?: number;
    dimensionUnit?: string;
    specifications?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
  }): Promise<Product> {
    return prisma.product.create({ data });
  }

  async createWithImages(
    data: Parameters<ProductService['create']>[0],
    images: Array<{
      filePath: string;
      thumbPath: string;
      altText: string;
      displayOrder: number;
      isPrimary: boolean;
    }>
  ): Promise<Product> {
    return prisma.$transaction(async transaction => {
      const product = await transaction.product.create({ data });
      if (images.length > 0) {
        await transaction.productImage.createMany({
          data: images.map(image => ({ ...image, productId: product.id })),
        });
      }
      return product;
    });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async updateWithImages(
    id: string,
    data: Partial<Product>,
    images: Array<{
      filePath: string;
      thumbPath: string;
      altText: string;
      displayOrder: number;
      isPrimary: boolean;
    }>
  ): Promise<Product> {
    return prisma.$transaction(async transaction => {
      const product = await transaction.product.update({ where: { id }, data });
      if (images.length > 0) {
        await transaction.productImage.createMany({
          data: images.map(image => ({ ...image, productId: id })),
        });
      }
      return product;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async getFeatured(limit = 6) {
    const items = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
    return items.map(p => this.formatProduct(p as ProductWithImages));
  }

  async getRelated(productId: string, categoryId: string, limit = 4) {
    const items = await prisma.product.findMany({
      where: { isPublished: true, categoryId, id: { not: productId } },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map(p => this.formatProduct(p as ProductWithImages));
  }
}

export const productService = new ProductService();
