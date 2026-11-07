import { Request, Response } from 'express';
import { z } from 'zod';
import { deleteFileIfExists } from '../utils/fileHelpers';
import { productService } from '../services/product.service';
import { imageService } from '../services/image.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import path from 'path';
import { uploadRoot } from '../config/uploads';

const productFields = {
  name: z.string().trim().min(1).max(200),
  modelCode: z.string().trim().min(1).max(50),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().min(1),
  description: z.string().max(10000).optional(),
  material: z.string().max(500).optional(),
  length: z.coerce.number().finite().positive().optional(),
  width: z.coerce.number().finite().positive().optional(),
  height: z.coerce.number().finite().positive().optional(),
  dimensionUnit: z.enum(['cm', 'mm', 'in']).optional(),
  specifications: z.string().max(10000).optional(),
  isFeatured: z.preprocess(value => value === 'true' || value === true, z.boolean()).optional(),
  isPublished: z.preprocess(value => value === 'true' || value === true, z.boolean()).optional(),
};

const createSchema = z.object(productFields).strict();
const updateSchema = z.object(productFields).partial().strict();

const uploadedFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

const removeUploadedFiles = (files: Express.Multer.File[]) =>
  Promise.all(files.map(file => deleteFileIfExists(file.path)));

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, featured, page, limit } = req.query;
  const querySchema = z.object({
    category: z.string().regex(/^[a-z0-9-]+$/).optional(),
    search: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().positive().max(100000).optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }).safeParse({ category, search, page, limit });
  if (!querySchema.success) {
    sendError(res, querySchema.error.issues[0].message, 400);
    return;
  }
  const filters = {
    categorySlug: querySchema.data.category,
    search: querySchema.data.search,
    isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    page: querySchema.data.page || 1,
    limit: querySchema.data.limit || 20,
  };
  const result = await productService.getPublished(filters);
  sendSuccess(res, result);
});

export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.getFeatured(6);
  sendSuccess(res, products);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const product = await productService.getBySlug(slug);
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  const related = await productService.getRelated(product.id, product.category.id);
  sendSuccess(res, { product, related });
});

export const getAllProductsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const querySchema = z.object({
    search: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().positive().max(100000).optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }).safeParse({ search, page, limit });
  if (!querySchema.success) {
    sendError(res, querySchema.error.issues[0].message, 400);
    return;
  }
  const result = await productService.getAll({
    search: querySchema.data.search,
    page: querySchema.data.page || 1,
    limit: querySchema.data.limit || 20,
  });
  sendSuccess(res, result);
});

export const getProductAdmin = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(String(req.params.id));
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  sendSuccess(res, product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    await removeUploadedFiles(uploadedFiles(req));
    sendError(res, result.error.issues[0].message);
    return;
  }
  const files = uploadedFiles(req);
  const token = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];

  const processedImages: Array<{ filePath: string; thumbPath: string }> = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const processed = await imageService.processAndSave(
        files[i].path,
        path.join(uploadRoot, 'products')
      );
      const filename = path.basename(processed.filePath);
      const storagePath = `uploads/products/${filename}`;
      await imageService.syncToSupabaseStorage(processed.filePath, storagePath, 'image/webp', token);
      const thumbFilename = path.basename(processed.thumbPath);
      const thumbStoragePath = `uploads/thumbnails/${thumbFilename}`;
      await imageService.syncToSupabaseStorage(processed.thumbPath, thumbStoragePath, 'image/webp', token);
      processedImages.push(processed);
    }
    await productService.createWithImages(result.data, processedImages.map((image, i) => ({
      ...image,
      altText: `Product image ${i + 1} — ${result.data.name}`,
      displayOrder: i,
      isPrimary: i === 0,
    })));
  } catch (error) {
    for (const image of processedImages) await imageService.removeProcessedFiles(image);
    await removeUploadedFiles(files);
    throw error;
  }
  const created = await productService.getBySlug(result.data.slug, false);
  sendSuccess(res, created, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    await removeUploadedFiles(uploadedFiles(req));
    sendError(res, result.error.issues[0].message);
    return;
  }

  const files = uploadedFiles(req);
  const token = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];
  const { prisma } = await import('../config/database');
  const existingImages = await prisma.productImage.findMany({
    where: { productId: id },
    select: { displayOrder: true },
  });
  const current = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!current) {
    await removeUploadedFiles(files);
    sendError(res, 'Product not found', 404);
    return;
  }
  const existingCount = existingImages.length;
  const nextDisplayOrder = existingImages.reduce(
    (maxOrder, image) => Math.max(maxOrder, image.displayOrder),
    -1
  ) + 1;
  const processedImages: Array<{ filePath: string; thumbPath: string }> = [];

  try {
    for (const file of files) {
      const processed = await imageService.processAndSave(
        file.path,
        path.join(uploadRoot, 'products')
      );
      const filename = path.basename(processed.filePath);
      const storagePath = `uploads/products/${filename}`;
      await imageService.syncToSupabaseStorage(processed.filePath, storagePath, 'image/webp', token);
      const thumbFilename = path.basename(processed.thumbPath);
      const thumbStoragePath = `uploads/thumbnails/${thumbFilename}`;
      await imageService.syncToSupabaseStorage(processed.thumbPath, thumbStoragePath, 'image/webp', token);
      processedImages.push(processed);
    }
    const product = await productService.updateWithImages(id, result.data, processedImages.map((image, index) => ({
      filePath: image.filePath,
      thumbPath: image.thumbPath,
      altText: `Product image ${nextDisplayOrder + index + 1} — ${result.data.name || 'Furniture'}`,
      displayOrder: nextDisplayOrder + index,
      isPrimary: existingCount === 0 && index === 0,
    })));
    sendSuccess(res, product, 'Product updated');
  } catch (error) {
    for (const image of processedImages) {
      await imageService.removeProcessedFiles(image);
    }
    await removeUploadedFiles(files);
    throw error;
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const token = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];
  const { prisma } = await import('../config/database');
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  for (const image of images) {
    await imageService.deleteImage(image.id, id, token);
  }
  await imageService.deleteProductFolderFromStorage(id, token);
  await productService.delete(id);
  sendSuccess(res, null, 'Product deleted');
});

export const deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const imageId = String(req.params.imageId);
  const token = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '')?.[1];
  const { prisma } = await import('../config/database');
  const product = await prisma.product.findUnique({ where: { id }, select: { isPublished: true } });
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  await imageService.deleteImage(imageId, id, token);
  sendSuccess(res, null, 'Image deleted');
});

export const replaceProductImage = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const imageId = String(req.params.imageId);
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined;
  if (!req.file) {
    sendError(res, 'Choose an image to upload.');
    return;
  }
  const processed = await imageService.processAndSave(
    req.file.path,
    path.join(uploadRoot, 'products')
  );
  try {
    const filename = path.basename(processed.filePath);
    const storagePath = `uploads/products/${filename}`;
    await imageService.syncToSupabaseStorage(processed.filePath, storagePath, 'image/webp', token);
    await imageService.replaceImage(id, imageId, processed, token);
    sendSuccess(res, null, 'Image replaced');
  } catch (error) {
    await imageService.removeProcessedFiles(processed);
    throw error;
  }
});

export const reorderProductImages = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parsed = z.object({
    orders: z.array(z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })).min(1),
  }).safeParse(req.body);
  if (!parsed.success) {
    sendError(res, parsed.error.issues[0].message);
    return;
  }
  await imageService.reorderImages(id, parsed.data.orders);
  sendSuccess(res, null, 'Images reordered');
});

export const setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const imageId = String(req.params.imageId);
  const { prisma } = await import('../config/database');
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!image) {
    sendError(res, 'Product image not found', 404);
    return;
  }
  await prisma.$transaction(async transaction => {
    await transaction.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } });
    await transaction.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
  });
  sendSuccess(res, null, 'Primary image set');
});
