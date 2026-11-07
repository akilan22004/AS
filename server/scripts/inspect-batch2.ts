import sharp from 'sharp';
import path from 'path';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';

const files = [
  'media_1793901504501_993478d2.jpg',
  'media_1793901527066_6a140284.jpg',
  'media_1793901535431_4544d800.jpg',
  'media_1793901542957_148f27ca.jpg',
  'media_1793901548773_f794232a.jpg'
];

async function inspect() {
  for (const f of files) {
    const filePath = path.join(userUploads, f);
    const meta = await sharp(filePath).metadata();
    console.log(`${f}: ${meta.width}x${meta.height}`);
  }
}

inspect().catch(console.error);
