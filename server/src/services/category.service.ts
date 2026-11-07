import { prisma } from '../config/database';
import { Category } from '@prisma/client';

export class CategoryService {
  async getAll(visibleOnly = false): Promise<Category[]> {
    return prisma.category.findMany({
      where: visibleOnly ? { isVisible: true } : undefined,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  }

  async create(data: { name: string; slug: string; description?: string; displayOrder?: number }): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();
