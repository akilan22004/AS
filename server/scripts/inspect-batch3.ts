import sharp from 'sharp';
import path from 'path';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';

const files = [
  'media_1793903484383_60e68785.jpg',
  'media_1793903490285_4b7a2e80.jpg',
  'media_1793903498207_29c60da0.jpg'
];

async function inspect() {
  for (const f of files) {
    const filePath = path.join(userUploads, f);
    const meta = await sharp(filePath).metadata();
    console.log(`${f}: ${meta.width}x${meta.height}`);
  }
}

inspect().catch(console.error);
