import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';
const clientAssets = path.resolve(__dirname, '../../client/public/assets');

async function run() {
  if (!fs.existsSync(clientAssets)) {
    fs.mkdirSync(clientAssets, { recursive: true });
  }

  // 1. From Craftsmanship (media_1793903484383_60e68785.jpg)
  const craftImg = path.join(userUploads, 'media_1793903484383_60e68785.jpg');
  // Artisan carving hero (top right)
  await sharp(craftImg)
    .extract({ left: 140, top: 35, width: 201, height: 165 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'craft-hero-carving.jpg'));

  // Master artisan senior carving headboard (approx y: 330 to y: 460)
  await sharp(craftImg)
    .extract({ left: 154, top: 330, width: 178, height: 135 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'craft-artisan-senior.jpg'));

  // Dovetail wooden joints (approx y: 474 to y: 605)
  await sharp(craftImg)
    .extract({ left: 0, top: 475, width: 220, height: 130 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'craft-dovetail-joint.jpg'));

  // Bottom sofa / armchair hero (approx y: 720 to y: 885)
  await sharp(craftImg)
    .extract({ left: 130, top: 724, width: 211, height: 160 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'craft-wood-lives-longer.jpg'));

  // 2. From Testimonials/Showcase (media_1793903490285_4b7a2e80.jpg)
  const showcaseImg = path.join(userUploads, 'media_1793903490285_4b7a2e80.jpg');
  // Card 1 Living room
  await sharp(showcaseImg)
    .extract({ left: 10, top: 214, width: 135, height: 98 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'showcase-living.jpg'));

  // Card 2 Bedroom
  await sharp(showcaseImg)
    .extract({ left: 10, top: 322, width: 135, height: 98 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'showcase-bedroom.jpg'));

  // Card 3 Dining
  await sharp(showcaseImg)
    .extract({ left: 10, top: 430, width: 135, height: 98 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'showcase-dining.jpg'));

  // Showroom interior (bottom banner)
  await sharp(showcaseImg)
    .extract({ left: 0, top: 780, width: 341, height: 145 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'showcase-showroom-visit.jpg'));

  // 3. From Our Collections (media_1793903498207_29c60da0.jpg)
  const collectionsImg = path.join(userUploads, 'media_1793903498207_29c60da0.jpg');
  // Custom furniture artisan carving photo
  await sharp(collectionsImg)
    .extract({ left: 175, top: 640, width: 160, height: 110 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'collections-custom-artisan.jpg'));

  // Category cards photos
  await sharp(collectionsImg)
    .extract({ left: 19, top: 285, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-sofas.jpg'));

  await sharp(collectionsImg)
    .extract({ left: 174, top: 285, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-beds.jpg'));

  await sharp(collectionsImg)
    .extract({ left: 19, top: 402, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-dining.jpg'));

  await sharp(collectionsImg)
    .extract({ left: 174, top: 402, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-wardrobes.jpg'));

  await sharp(collectionsImg)
    .extract({ left: 19, top: 520, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-tv.jpg'));

  await sharp(collectionsImg)
    .extract({ left: 174, top: 520, width: 148, height: 68 })
    .jpeg({ quality: 90 })
    .toFile(path.join(clientAssets, 'cat-card-dressing.jpg'));

  console.log('Batch 3 assets extracted successfully!');
}

run().catch(console.error);
