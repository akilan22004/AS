import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { getPublicImageUrl } from '../utils/fileHelpers';
import { imageService } from '../services/image.service';
import path from 'path';
import { uploadRoot } from '../config/uploads';
import { z } from 'zod';
import { deleteFileIfExists } from '../utils/fileHelpers';

const createSchema = z.object({
  title: z.string().max(200).optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
}).strict();
const updateSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
}).strict();

export const getPublishedPromo = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.promotionalMedia.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
  });
  const formatted = items.map(item => ({
    ...item,
    url: getPublicImageUrl(item.filePath),
    posterUrl: getPublicImageUrl(item.posterPath),
  }));
  sendSuccess(res, formatted);
});

export const getAllPromo = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.promotionalMedia.findMany({ orderBy: { displayOrder: 'asc' } });
  const formatted = items.map(item => ({
    ...item,
    url: getPublicImageUrl(item.filePath),
    posterUrl: getPublicImageUrl(item.posterPath),
  }));
  sendSuccess(res, formatted);
});

export const createPromo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    sendError(res, 'No file uploaded');
    return;
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    await deleteFileIfExists(req.file.path);
    sendError(res, parsed.error.issues[0].message);
    return;
  }

  const image = await imageService.processAndSave(req.file.path, path.join(uploadRoot, 'promotional'));
  let item;
  try {
    item = await prisma.promotionalMedia.create({
      data: {
        filePath: image.filePath,
        posterPath: image.thumbPath,
        title: parsed.data.title || null,
        mediaType: 'image',
        displayOrder: parsed.data.displayOrder || 0,
      },
    });
  } catch (error) {
    await imageService.removeProcessedFiles(image);
    throw error;
  }

  sendSuccess(res, { ...item, url: getPublicImageUrl(item.filePath) }, 'Promotional media created', 201);
});

export const updatePromo = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, parsed.error.issues[0].message);
    return;
  }
  const item = await prisma.promotionalMedia.update({ where: { id }, data: parsed.data });
  sendSuccess(res, item, 'Updated');
});

export const deletePromo = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const item = await prisma.promotionalMedia.findUnique({ where: { id } });
  if (!item) {
    sendError(res, 'Promotional media not found', 404);
    return;
  }
  await prisma.promotionalMedia.delete({ where: { id } });
  await deleteFileIfExists(item.filePath);
  if (item.posterPath) await deleteFileIfExists(item.posterPath);
  sendSuccess(res, null, 'Deleted');
});
