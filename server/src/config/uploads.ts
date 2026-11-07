import path from 'path';

const serverRoot = path.resolve(__dirname, '../..');
const configuredUploadRoot = process.env.UPLOAD_DIR;

export const uploadRoot = path.resolve(
  serverRoot,
  configuredUploadRoot || 'uploads'
);
