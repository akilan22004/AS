import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    totalCategories,
    totalImages,
    totalPromo,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.count({ where: { isPublished: false } }),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.promotionalMedia.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: { select: { name: true } },
        images: { take: 1, where: { isPrimary: true } },
      },
    }),
  ]);

  sendSuccess(res, {
    totalProducts,
    publishedProducts,
    draftProducts,
    totalCategories,
    totalImages,
    totalPromo,
    recentProducts,
  });
});
