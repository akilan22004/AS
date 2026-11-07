import sharp from 'sharp';
import path from 'path';

const artifactsDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe';
const destDir = 'C:/Users/Welcome/Downloads/AM/client/public/assets';

async function processTVUnit() {
  const tvImg = path.join(artifactsDir, 'cat_tv_units_hq_1793931529242.jpg');
  const meta = await sharp(tvImg).metadata();
  console.log(`TV Unit master: ${meta.width}x${meta.height}`);
  const W = meta.width || 1200;
  const H = meta.height || 896;

  // cat-tv-units.jpg
  await sharp(tvImg)
    .extract({ left: Math.floor(W * 0.15), top: Math.floor(H * 0.2), width: Math.floor(W * 0.7), height: Math.floor(H * 0.6) })
    .resize(500, 400)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-tv-units.jpg'));

  // cat-card-tv.jpg
  await sharp(tvImg)
    .extract({ left: Math.floor(W * 0.1), top: Math.floor(H * 0.25), width: Math.floor(W * 0.8), height: Math.floor(H * 0.5) })
    .resize(600, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-card-tv.jpg'));

  // p-tv-unit.jpg
  await sharp(tvImg)
    .extract({ left: Math.floor(W * 0.15), top: Math.floor(H * 0.2), width: Math.floor(W * 0.7), height: Math.floor(H * 0.6) })
    .resize(700, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-tv-unit.jpg'));

  console.log('Processed TV Unit HD assets!');
}

processTVUnit().catch(console.error);
