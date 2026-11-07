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

  // 1. Armchair without any letters from "Memories"
  await sharp(img9).extract({ left: 235, top: 38, width: 106, height: 160 }).toFile(path.join(clientAssets, 'about-hero-armchair.jpg'));

  // 2. Pure Map illustration canvas without the button on the right
  await sharp(img10).extract({ left: 12, top: 662, width: 195, height: 65 }).toFile(path.join(clientAssets, 'contact-map.jpg'));

  console.log('✅ Final asset refinements complete!');
}

run().catch(console.error);
