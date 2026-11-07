import sharp from 'sharp';
import path from 'path';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';

const files = [
  'media_1793898033095_b036e103.jpg',
  'media_1793898038476_0ce558f7.jpg',
  'media_1793898045097_664eee75.jpg',
  'media_1793898051179_c13f4609.jpg',
  'media_1793898056984_057a3ae9.jpg'
];

async function inspect() {
  for (const f of files) {
    const filePath = path.join(userUploads, f);
    const meta = await sharp(filePath).metadata();
    console.log(`${f}: ${meta.width}x${meta.height}`);
  }
}

inspect().catch(console.error);
