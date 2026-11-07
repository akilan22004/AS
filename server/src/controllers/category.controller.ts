import { Request, Response } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/category.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  displayOrder: z.number().int().min(0).optional(),
}).strict();
const updateSchema = createSchema.partial().extend({
  isVisible: z.boolean().optional(),
}).strict();

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAll(true);
  sendSuccess(res, categories);
});

export const getAdminCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAll(false);
  sendSuccess(res, categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, result.error.issues[0].message);
    return;
  }
  const category = await categoryService.create(result.data);
  sendSuccess(res, category, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, result.error.issues[0].message);
    return;
  }
  const category = await categoryService.update(id, result.data);
  sendSuccess(res, category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await categoryService.delete(id);
  sendSuccess(res, null, 'Category deleted');
});
