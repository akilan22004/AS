import sharp from 'sharp';
import path from 'path';
import { prisma } from '../config/database';
import { deleteFileIfExists, ensureDirectoryExists } from '../utils/fileHelpers';
import { uploadRoot } from '../config/uploads';

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class ImageService {
  private resolveStoredFile(filePath: string): string {
    if (path.isAbsolute(filePath)) return filePath;
    const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const uploadPrefix = 'uploads/';
    return normalized.startsWith(uploadPrefix)
      ? path.join(uploadRoot, normalized.slice(uploadPrefix.length))
      : path.resolve(uploadRoot, normalized);
  }

  async processAndSave(
    filePath: string,
    uploadDir: string
  ): Promise<{ filePath: string; thumbPath: string }> {
    const thumbDir = path.join(uploadDir, '..', 'thumbnails');
    await ensureDirectoryExists(uploadDir);
    await ensureDirectoryExists(thumbDir);

    const filename = path.basename(filePath, path.extname(filePath));
    const optimizedPath = path.join(uploadDir, `${filename}_optimized.webp`);
    const thumbPath = path.join(thumbDir, `${filename}_thumb.webp`);

    try {
      const metadata = await sharp(filePath, { failOn: 'error', limitInputPixels: 80_000_000 }).metadata();
      if (
        !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
        !metadata.width ||
        !metadata.height ||
        Math.min(metadata.width, metadata.height) < 600 ||
        Math.max(metadata.width, metadata.height) < 800
      ) {
        throw new ImageUploadError('Use a valid JPEG, PNG, or WebP product photo at least 800 × 600 pixels.');
      }

      await sharp(filePath, { failOn: 'error', limitInputPixels: 80_000_000 })
        .rotate()
        .resize(2560, 2560, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 92, effort: 4 })
        .toFile(optimizedPath);

      await sharp(filePath, { failOn: 'error', limitInputPixels: 80_000_000 })
        .rotate()
        .resize(400, 300, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82 })
        .toFile(thumbPath);

      await deleteFileIfExists(filePath);
      return { filePath: optimizedPath, thumbPath };
    } catch (error) {
      await deleteFileIfExists(filePath);
      await deleteFileIfExists(optimizedPath);
      await deleteFileIfExists(thumbPath);
      if (error instanceof ImageUploadError) throw error;
      throw new ImageUploadError('The uploaded file is not a supported, decodable image.');
    }
  }

  async syncToSupabaseStorage(
    localPath: string,
    storagePath: string,
    contentType = 'image/webp',
    token?: string
  ): Promise<string | null> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !key) return null;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, key, {
        auth: { persistSession: false },
        ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
      });

      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(localPath);
      const cleanPath = storagePath.replace(/^\/+/, '');
      const { data, error } = await supabase.storage
        .from('furniture_image')
        .upload(cleanPath, fileBuffer, { contentType, upsert: true });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('furniture_image').getPublicUrl(cleanPath);
        return urlData?.publicUrl || cleanPath;
      }
    } catch (err) {
      console.warn('[ImageService] Supabase storage upload attempt warning:', err);
    }
    return null;
  }

  async removeProcessedFiles(files: { filePath: string; thumbPath: string }): Promise<void> {
    await deleteFileIfExists(files.filePath);
    await deleteFileIfExists(files.thumbPath);
  }

  extractStoragePath(filePath: string): string {
    if (!filePath) return '';
    let p = filePath.replace(/\\/g, '/');
    const marker = '/furniture_image/';
    const idx = p.indexOf(marker);
    if (idx !== -1) {
      p = p.substring(idx + marker.length);
    }
    return p.replace(/^\/+/, '');
  }

  async deleteImage(imageId: string, productId: string, token?: string): Promise<void> {
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) return;

    await prisma.$transaction(async transaction => {
      await transaction.productImage.delete({ where: { id: imageId } });
      if (image.isPrimary) {
        const nextImage = await transaction.productImage.findFirst({
          where: { productId },
          orderBy: { displayOrder: 'asc' },
        });
        if (nextImage) {
          await transaction.productImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } });
        }
      }
    });
    await deleteFileIfExists(this.resolveStoredFile(image.filePath));
    if (image.thumbPath) await deleteFileIfExists(this.resolveStoredFile(image.thumbPath));

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (supabaseUrl && key) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, key, {
          auth: { persistSession: false },
          ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
        });
        const cleanPath = this.extractStoragePath(image.filePath);
        const cleanThumb = image.thumbPath ? this.extractStoragePath(image.thumbPath) : null;
        const toDelete = [cleanPath, cleanThumb].filter(Boolean) as string[];
        if (toDelete.length > 0) {
          await supabase.storage.from('furniture_image').remove(toDelete).catch(() => {});
        }
      } catch {}
    }
  }

  async deleteProductFolderFromStorage(productId: string, token?: string): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !key) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, key, {
        auth: { persistSession: false },
        ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
      });

      const { data: files } = await supabase.storage.from('furniture_image').list(`products/${productId}`);
      if (files && files.length > 0) {
        const filePaths = files.map(f => `products/${productId}/${f.name}`);
        await supabase.storage.from('furniture_image').remove(filePaths).catch(() => {});
      }
    } catch (err) {
      console.warn('[ImageService] deleteProductFolderFromStorage warning:', err);
    }
  }

  async replaceImage(
    productId: string,
    imageId: string,
    replacement: { filePath: string; thumbPath: string },
    token?: string
  ): Promise<void> {
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new Error('Product image not found');

    const oldFilePath = image.filePath;
    const oldThumbPath = image.thumbPath;

    await prisma.productImage.update({
      where: { id: imageId },
      data: { filePath: replacement.filePath, thumbPath: replacement.thumbPath },
    });
    await deleteFileIfExists(this.resolveStoredFile(oldFilePath));
    if (oldThumbPath) await deleteFileIfExists(this.resolveStoredFile(oldThumbPath));

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (supabaseUrl && key) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, key, {
          auth: { persistSession: false },
          ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
        });
        const cleanOldPath = this.extractStoragePath(oldFilePath);
        const cleanOldThumb = oldThumbPath ? this.extractStoragePath(oldThumbPath) : null;
        const toDelete = [cleanOldPath, cleanOldThumb].filter(Boolean) as string[];
        if (toDelete.length > 0) {
          await supabase.storage.from('furniture_image').remove(toDelete).catch(() => {});
        }
      } catch (err) {
        console.warn('[ImageService] replaceImage Supabase removal warning:', err);
      }
    }
  }

  async reorderImages(productId: string, imageOrders: { id: string; order: number }[]): Promise<void> {
    if (new Set(imageOrders.map(image => image.id)).size !== imageOrders.length) {
      throw new Error('Duplicate image IDs are not allowed');
    }
    const matchingCount = await prisma.productImage.count({
      where: { productId, id: { in: imageOrders.map(image => image.id) } },
    });
    if (matchingCount !== imageOrders.length) throw new Error('One or more images do not belong to this product');
    await prisma.$transaction(
      imageOrders.map(({ id, order }) =>
        prisma.productImage.update({ where: { id }, data: { displayOrder: order } })
      )
    );
  }
}

export const imageService = new ImageService();
