import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export const generateUniqueFilename = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${ext}`;
};

export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const deleteFileIfExists = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist, that's okay
  }
};

export const getPublicImageUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const normalized = filePath.replace(/\\/g, '/');
  const uploadsIndex = normalized.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return normalized.substring(uploadsIndex);
  }
  return `/${normalized.replace(/^\/+/, '')}`;
};
