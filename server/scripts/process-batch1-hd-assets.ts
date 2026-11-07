import sharp from 'sharp';
import path from 'path';

const artifactsDir = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe';
const destDir = 'C:/Users/Welcome/Downloads/AM/client/public/assets';

async function processHDAssets() {
  // 1. Bed Image
  const bedImg = path.join(artifactsDir, 'cat_beds_hq_1793931371550.jpg');
  const bedMeta = await sharp(bedImg).metadata();
  console.log(`Bed master: ${bedMeta.width}x${bedMeta.height}`);
  const bW = bedMeta.width || 1376;
  const bH = bedMeta.height || 768;

  // cat-beds.jpg
  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.15), top: Math.floor(bH * 0.2), width: Math.floor(bW * 0.7), height: Math.floor(bH * 0.7) })
    .resize(500, 400)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-beds.jpg'));

  // cat-card-beds.jpg
  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.1), top: Math.floor(bH * 0.18), width: Math.floor(bW * 0.8), height: Math.floor(bH * 0.55) })
    .resize(600, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-card-beds.jpg'));

  // p-premium-bed.jpg & p-royal-carved-bed.jpg
  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.15), top: Math.floor(bH * 0.18), width: Math.floor(bW * 0.7), height: Math.floor(bH * 0.65) })
    .resize(700, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-premium-bed.jpg'));

  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.15), top: Math.floor(bH * 0.18), width: Math.floor(bW * 0.7), height: Math.floor(bH * 0.65) })
    .resize(700, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-royal-carved-bed.jpg'));

  // featured-bed.jpg (wide banner)
  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.08), top: Math.floor(bH * 0.2), width: Math.floor(bW * 0.84), height: Math.floor(bH * 0.45) })
    .resize(900, 400)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'featured-bed.jpg'));

  // showcase-bedroom.jpg
  await sharp(bedImg)
    .extract({ left: Math.floor(bW * 0.12), top: Math.floor(bH * 0.15), width: Math.floor(bW * 0.75), height: Math.floor(bH * 0.7) })
    .resize(600, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'showcase-bedroom.jpg'));
  console.log('Processed Bed HD assets!');

  // 2. Dining Set
  const diningImg = path.join(artifactsDir, 'cat_dining_hq_1793931396338.jpg');
  const dMeta = await sharp(diningImg).metadata();
  console.log(`Dining master: ${dMeta.width}x${dMeta.height}`);
  const dW = dMeta.width || 1376;
  const dH = dMeta.height || 768;

  // cat-dining.jpg & cat-card-dining.jpg
  await sharp(diningImg)
    .extract({ left: Math.floor(dW * 0.12), top: Math.floor(dH * 0.15), width: Math.floor(dW * 0.75), height: Math.floor(dH * 0.7) })
    .resize(500, 400)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-dining.jpg'));

  await sharp(diningImg)
    .extract({ left: Math.floor(dW * 0.1), top: Math.floor(dH * 0.2), width: Math.floor(dW * 0.8), height: Math.floor(dH * 0.5) })
    .resize(600, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-card-dining.jpg'));

  // p-dining-set.jpg
  await sharp(diningImg)
    .extract({ left: Math.floor(dW * 0.12), top: Math.floor(dH * 0.15), width: Math.floor(dW * 0.75), height: Math.floor(dH * 0.7) })
    .resize(700, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-dining-set.jpg'));

  // dining-showcase.jpg (wide banner)
  await sharp(diningImg)
    .extract({ left: Math.floor(dW * 0.05), top: Math.floor(dH * 0.2), width: Math.floor(dW * 0.9), height: Math.floor(dH * 0.45) })
    .resize(900, 400)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'dining-showcase.jpg'));

  // showcase-dining.jpg
  await sharp(diningImg)
    .extract({ left: Math.floor(dW * 0.12), top: Math.floor(dH * 0.15), width: Math.floor(dW * 0.75), height: Math.floor(dH * 0.7) })
    .resize(600, 450)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'showcase-dining.jpg'));
  console.log('Processed Dining HD assets!');

  // 3. Wardrobe
  const wardrobeImg = path.join(artifactsDir, 'cat_wardrobes_hq_1793931429598.jpg');
  const wMeta = await sharp(wardrobeImg).metadata();
  console.log(`Wardrobe master: ${wMeta.width}x${wMeta.height}`);
  const wW = wMeta.width || 1376;
  const wH = wMeta.height || 768;

  // cat-wardrobes.jpg & cat-card-wardrobes.jpg
  await sharp(wardrobeImg)
    .extract({ left: Math.floor(wW * 0.2), top: Math.floor(wH * 0.05), width: Math.floor(wW * 0.6), height: Math.floor(wH * 0.9) })
    .resize(500, 500)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-wardrobes.jpg'));

  await sharp(wardrobeImg)
    .extract({ left: Math.floor(wW * 0.15), top: Math.floor(wH * 0.1), width: Math.floor(wW * 0.7), height: Math.floor(wH * 0.55) })
    .resize(600, 300)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-card-wardrobes.jpg'));

  // p-wardrobe.jpg
  await sharp(wardrobeImg)
    .extract({ left: Math.floor(wW * 0.2), top: Math.floor(wH * 0.05), width: Math.floor(wW * 0.6), height: Math.floor(wH * 0.9) })
    .resize(600, 600)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'p-wardrobe.jpg'));
  console.log('Processed Wardrobe HD assets!');

  // 4. Accent Chair
  const chairImg = path.join(artifactsDir, 'cat_chairs_hq_1793931459359.jpg');
  const cMeta = await sharp(chairImg).metadata();
  console.log(`Chair master: ${cMeta.width}x${cMeta.height}`);
  const cW = cMeta.width || 1376;
  const cH = cMeta.height || 768;

  // cat-chairs.jpg
  await sharp(chairImg)
    .extract({ left: Math.floor(cW * 0.2), top: Math.floor(cH * 0.1), width: Math.floor(cW * 0.6), height: Math.floor(cH * 0.8) })
    .resize(500, 500)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'cat-chairs.jpg'));

  // about-hero-armchair.jpg & testimonials-hero-armchair.jpg & collections-hero-armchair.jpg
  await sharp(chairImg)
    .extract({ left: Math.floor(cW * 0.22), top: Math.floor(cH * 0.08), width: Math.floor(cW * 0.55), height: Math.floor(cH * 0.85) })
    .resize(600, 600)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'about-hero-armchair.jpg'));

  await sharp(chairImg)
    .extract({ left: Math.floor(cW * 0.22), top: Math.floor(cH * 0.08), width: Math.floor(cW * 0.55), height: Math.floor(cH * 0.85) })
    .resize(600, 600)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'testimonials-hero-armchair.jpg'));

  await sharp(chairImg)
    .extract({ left: Math.floor(cW * 0.22), top: Math.floor(cH * 0.08), width: Math.floor(cW * 0.55), height: Math.floor(cH * 0.85) })
    .resize(600, 600)
    .jpeg({ quality: 92 })
    .toFile(path.join(destDir, 'collections-hero-armchair.jpg'));
  console.log('Processed Chair HD assets!');
}

processHDAssets().catch(console.error);
