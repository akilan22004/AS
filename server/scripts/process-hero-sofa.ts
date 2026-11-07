import sharp from 'sharp';
import path from 'path';

const source = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/hero_sofa_hq_1793931278942.jpg';
const destDir = 'C:/Users/Welcome/Downloads/AM/client/public/assets';

async function processSofa() {
  const meta = await sharp(source).metadata();
  console.log(`Source master image: ${meta.width}x${meta.height}`);
  const W = meta.width || 1376;
  const H = meta.height || 768;

  // 1. Hero Sofa (Full width landscape for Homepage top slider)
  await sharp(source)
    .extract({ left: 100, top: 120, width: W - 120, height: H - 140 })
    .resize(1200, 600)
    .jpeg({ quality: 94 })
    .toFile(path.join(destDir, 'hero-sofa.jpg'));
  console.log('Processed hero-sofa.jpg');

  // 2. Product Catalog Classic Sofa
  await sharp(source)
    .extract({ left: 350, top: 250, width: 750, height: 480 })
    .resize(700, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-classic-sofa.jpg'));
  console.log('Processed p-classic-sofa.jpg');

  // 3. Category icon & card
  await sharp(source)
    .extract({ left: 380, top: 280, width: 680, height: 450 })
    .resize(500, 330)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-sofas.jpg'));

  await sharp(source)
    .extract({ left: 350, top: 260, width: 750, height: 380 })
    .resize(600, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-card-sofas.jpg'));
  console.log('Processed cat-sofas.jpg & cat-card-sofas.jpg');

  // 4. Detail Page Main Image
  await sharp(source)
    .extract({ left: 200, top: 150, width: 1000, height: 580 })
    .resize(1400, 810)
    .jpeg({ quality: 94 })
    .toFile(path.join(destDir, 'p-detail-sofa-main.jpg'));
  console.log('Processed p-detail-sofa-main.jpg');

  // 5. Detail Page Multi-Angle Thumbnails
  // Thumb 1: Full sofa front view
  await sharp(source)
    .extract({ left: 350, top: 250, width: 750, height: 480 })
    .resize(300, 190)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-detail-thumb-1.jpg'));

  // Thumb 2: Macro zoom of carved floral armrest
  await sharp(source)
    .extract({ left: 380, top: 380, width: 220, height: 220 })
    .resize(300, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-detail-thumb-2.jpg'));

  // Thumb 3: Macro zoom of upholstery & textured cushion
  await sharp(source)
    .extract({ left: 720, top: 350, width: 240, height: 240 })
    .resize(300, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-detail-thumb-3.jpg'));

  // Thumb 4: Macro zoom of carved base & leg apron
  await sharp(source)
    .extract({ left: 450, top: 520, width: 300, height: 200 })
    .resize(300, 200)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-detail-thumb-4.jpg'));
  console.log('Processed all 4 detail thumbnails!');

  // Also update showcase-living.jpg
  await sharp(source)
    .extract({ left: 250, top: 200, width: 900, height: 520 })
    .resize(600, 350)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'showcase-living.jpg'));
  console.log('Processed showcase-living.jpg');
}

processSofa().catch(console.error);
