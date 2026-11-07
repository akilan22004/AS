import sharp from 'sharp';
import path from 'path';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';
const clientAssets = path.resolve(__dirname, '../../client/public/assets');

async function extractHeroes() {
  const showcaseImg = path.join(userUploads, 'media_1793903490285_4b7a2e80.jpg');
  await sharp(showcaseImg)
    .extract({ left: 165, top: 35, width: 176, height: 165 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'testimonials-hero-armchair.jpg'));

  const collectionsImg = path.join(userUploads, 'media_1793903498207_29c60da0.jpg');
  await sharp(collectionsImg)
    .extract({ left: 165, top: 35, width: 176, height: 165 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'collections-hero-armchair.jpg'));

  console.log('Top hero armchairs extracted!');
}

extractHeroes().catch(console.error);
