import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { generateUniqueFilename } from '../utils/fileHelpers';
import { uploadRoot } from './uploads';

const destinationFor = (folder: string): multer.DiskStorageOptions['destination'] =>
  (req, file, cb) => {
    const destination = path.join(uploadRoot, folder);
    fs.mkdir(destination, { recursive: true })
      .then(() => cb(null, destination))
      .catch((error: Error) => cb(error, destination));
  };

const storage = multer.diskStorage({
  destination: destinationFor('products'),
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});

const promoStorage = multer.diskStorage({
  destination: destinationFor('promotional'),
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});

const fileFilter = (allowedMimes: string[]) => (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);
if (!Number.isInteger(maxFileSizeMb) || maxFileSizeMb < 1 || maxFileSizeMb > 25) {
  throw new Error('MAX_FILE_SIZE_MB must be a whole number between 1 and 25');
}
const maxFileSize = maxFileSizeMb * 1024 * 1024;

export const productUpload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
});

export const MAX_PRODUCT_IMAGES_PER_REQUEST = 12;

export const promoUpload = multer({
  storage: promoStorage,
  limits: { fileSize: maxFileSize },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
});
