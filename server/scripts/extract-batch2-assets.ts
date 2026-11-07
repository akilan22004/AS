import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';
const clientAssets = 'c:/Users/Welcome/Downloads/AM/client/public/assets';
const serverUploads = 'c:/Users/Welcome/Downloads/AM/server/uploads/products';

const img6 = path.join(userUploads, 'media_1793901504501_993478d2.jpg'); // Beds Collection
const img7 = path.join(userUploads, 'media_1793901527066_6a140284.jpg'); // Add New Furniture
const img8 = path.join(userUploads, 'media_1793901535431_4544d800.jpg'); // Media Library
const img9 = path.join(userUploads, 'media_1793901542957_148f27ca.jpg'); // About Us
const img10 = path.join(userUploads, 'media_1793901548773_f794232a.jpg'); // Contact Us

async function run() {
  await fs.mkdir(clientAssets, { recursive: true });
  await fs.mkdir(serverUploads, { recursive: true });

  // img6 - Beds Collection
  await sharp(img6).extract({ left: 180, top: 38, width: 161, height: 160 }).toFile(path.join(clientAssets, 'beds-hero.jpg'));
  await sharp(img6).extract({ left: 9, top: 345, width: 156, height: 96 }).toFile(path.join(serverUploads, 'p-royal-carved-bed.jpg'));
  await sharp(img6).extract({ left: 176, top: 345, width: 156, height: 96 }).toFile(path.join(serverUploads, 'p-modern-teak-bed.jpg'));
  await sharp(img6).extract({ left: 9, top: 495, width: 156, height: 96 }).toFile(path.join(serverUploads, 'p-storage-bed.jpg'));
  await sharp(img6).extract({ left: 176, top: 495, width: 156, height: 96 }).toFile(path.join(serverUploads, 'p-canopy-bed.jpg'));
  await sharp(img6).extract({ left: 155, top: 655, width: 186, height: 120 }).toFile(path.join(clientAssets, 'beds-carved-post.jpg'));
  await sharp(img6).extract({ left: 0, top: 780, width: 210, height: 100 }).toFile(path.join(clientAssets, 'beds-custom-design.jpg'));

  // img7 - Add New Furniture armchair
  await sharp(img7).extract({ left: 380, top: 85, width: 196, height: 125 }).toFile(path.join(clientAssets, 'admin-add-armchair.jpg'));

  // img8 - Media Library wood timber (pure timber without left text)
  await sharp(img8).extract({ left: 380, top: 85, width: 196, height: 140 }).toFile(path.join(clientAssets, 'media-lib-wood.jpg'));

  // img9 - About Us
  // Hero right armchair (pure armchair without left letters)
  await sharp(img9).extract({ left: 210, top: 38, width: 131, height: 160 }).toFile(path.join(clientAssets, 'about-hero-armchair.jpg'));
  // Wood blocks stack (pure timber without left letters)
  await sharp(img9).extract({ left: 200, top: 455, width: 141, height: 110 }).toFile(path.join(clientAssets, 'about-wood-blocks.jpg'));
  // Large luxury showroom
  await sharp(img9).extract({ left: 0, top: 570, width: 341, height: 135 }).toFile(path.join(clientAssets, 'about-showroom.jpg'));
  // Tree cross section rings
  await sharp(img9).extract({ left: 0, top: 715, width: 166, height: 110 }).toFile(path.join(clientAssets, 'about-wood-rings.jpg'));

  // img10 - Contact Us map
  await sharp(img10).extract({ left: 12, top: 662, width: 317, height: 65 }).toFile(path.join(clientAssets, 'contact-map.jpg'));

  // Copy to client assets
  const serverFiles = await fs.readdir(serverUploads);
  for (const sf of serverFiles) {
    await fs.copyFile(path.join(serverUploads, sf), path.join(clientAssets, sf));
  }

  console.log('✅ Batch 2 crops perfected!');
}

run().catch(console.error);
