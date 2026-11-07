import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ImageUploadError } from '../services/image.service';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]', { name: err.name, method: req.method, path: req.path });

  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof ImageUploadError) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  if (err.message?.includes('File type not allowed')) {
    res.status(400).json({ success: false, error: 'Only JPEG, PNG, and WebP images are allowed.' });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError' && (err as Error & { code?: string }).code === 'P2002') {
    res.status(409).json({ success: false, error: 'A record with the same unique value already exists.' });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError' && (err as Error & { code?: string }).code === 'P2025') {
    res.status(404).json({ success: false, error: 'Requested record was not found.' });
    return;
  }

  res.status(500).json({ success: false, error: 'Internal server error' });
};
