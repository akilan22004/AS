import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const userUploads = 'C:/Users/Welcome/.gemini/antigravity/brain/b4ef3eb8-df9b-4cfc-8ff1-80cdd9bb76fe/.user_uploaded';
const clientAssets = 'c:/Users/Welcome/Downloads/AM/client/public/assets';
const serverUploads = 'c:/Users/Welcome/Downloads/AM/server/uploads/products';

const img1 = path.join(userUploads, 'media_1793898033095_b036e103.jpg'); // Home
const img2 = path.join(userUploads, 'media_1793898038476_0ce558f7.jpg'); // Categories
const img3 = path.join(userUploads, 'media_1793898045097_664eee75.jpg'); // Products
const img4 = path.join(userUploads, 'media_1793898051179_c13f4609.jpg'); // Detail
const img5 = path.join(userUploads, 'media_1793898056984_057a3ae9.jpg'); // Admin Login

async function run() {
  await fs.mkdir(clientAssets, { recursive: true });
  await fs.mkdir(serverUploads, { recursive: true });

  // 1. Logo tree icon
  await sharp(img5)
    .extract({ left: 245, top: 20, width: 85, height: 70 })
    .toFile(path.join(clientAssets, 'tree-logo.png'));

  // 2. Pure Hero sofa & living room without the baked text (y=38 to y=195)
  await sharp(img1)
    .extract({ left: 0, top: 38, width: 341, height: 160 })
    .toFile(path.join(clientAssets, 'hero-sofa.jpg'));

  // 3. 8 Categories from img1
  await sharp(img1).extract({ left: 12, top: 356, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-sofas.jpg'));
  await sharp(img1).extract({ left: 94, top: 356, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-beds.jpg'));
  await sharp(img1).extract({ left: 176, top: 356, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-dining.jpg'));
  await sharp(img1).extract({ left: 258, top: 356, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-wardrobes.jpg'));

  await sharp(img1).extract({ left: 12, top: 440, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-chairs.jpg'));
  await sharp(img1).extract({ left: 94, top: 440, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-tv-units.jpg'));
  await sharp(img1).extract({ left: 176, top: 440, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-dressing-tables.jpg'));
  await sharp(img1).extract({ left: 258, top: 440, width: 72, height: 62 }).toFile(path.join(clientAssets, 'cat-storage-cabinets.jpg'));

  // 4. Featured Bed (pure bed photo without heading text, top=580, height=75)
  await sharp(img1).extract({ left: 22, top: 580, width: 297, height: 75 }).toFile(path.join(clientAssets, 'featured-bed.jpg'));

  // 5. Craftsmanship photo
  await sharp(img1).extract({ left: 0, top: 678, width: 170, height: 135 }).toFile(path.join(clientAssets, 'craft-artisan.jpg'));

  // 6. Dining room showcase (y=824 to y=905, height=81)
  await sharp(img1).extract({ left: 0, top: 824, width: 341, height: 81 }).toFile(path.join(clientAssets, 'dining-showcase.jpg'));

  // 7. Products from Product Listing (img3)
  await sharp(img3).extract({ left: 9, top: 239, width: 156, height: 106 }).toFile(path.join(serverUploads, 'p-classic-sofa.jpg'));
  await sharp(img3).extract({ left: 176, top: 239, width: 156, height: 106 }).toFile(path.join(serverUploads, 'p-premium-bed.jpg'));
  await sharp(img3).extract({ left: 9, top: 434, width: 156, height: 106 }).toFile(path.join(serverUploads, 'p-dining-set.jpg'));
  await sharp(img3).extract({ left: 176, top: 434, width: 156, height: 106 }).toFile(path.join(serverUploads, 'p-wardrobe.jpg'));
  await sharp(img3).extract({ left: 9, top: 628, width: 156, height: 90 }).toFile(path.join(serverUploads, 'p-tv-unit.jpg'));
  await sharp(img3).extract({ left: 176, top: 628, width: 156, height: 90 }).toFile(path.join(serverUploads, 'p-dressing-table.jpg'));

  // 8. Product Detail Assets (img4)
  await sharp(img4).extract({ left: 7, top: 66, width: 327, height: 154 }).toFile(path.join(serverUploads, 'p-detail-sofa-main.jpg'));
  await sharp(img4).extract({ left: 24, top: 226, width: 74, height: 45 }).toFile(path.join(serverUploads, 'p-detail-thumb-1.jpg'));
  await sharp(img4).extract({ left: 106, top: 226, width: 69, height: 45 }).toFile(path.join(serverUploads, 'p-detail-thumb-2.jpg'));
  await sharp(img4).extract({ left: 181, top: 226, width: 71, height: 45 }).toFile(path.join(serverUploads, 'p-detail-thumb-3.jpg'));
  await sharp(img4).extract({ left: 258, top: 226, width: 65, height: 45 }).toFile(path.join(serverUploads, 'p-detail-thumb-4.jpg'));

  // Pure wood grain texture (y=627 to 696)
  await sharp(img4).extract({ left: 12, top: 627, width: 122, height: 69 }).toFile(path.join(clientAssets, 'wood-grain.jpg'));

  // You May Also Like pure photo crops (without the top text):
  await sharp(img4).extract({ left: 8, top: 738, width: 103, height: 44 }).toFile(path.join(serverUploads, 'p-like-1.jpg'));
  await sharp(img4).extract({ left: 119, top: 738, width: 103, height: 44 }).toFile(path.join(serverUploads, 'p-like-2.jpg'));
  await sharp(img4).extract({ left: 230, top: 738, width: 103, height: 44 }).toFile(path.join(serverUploads, 'p-like-3.jpg'));

  // Explore sofa banner pure sofa photo (right side from x=165, y=840, width=176, height=76)
  await sharp(img4).extract({ left: 165, top: 840, width: 176, height: 76 }).toFile(path.join(clientAssets, 'explore-sofa-right.jpg'));

  // Admin Portal Assets (img5: 576x1024)
  await sharp(img5).extract({ left: 0, top: 0, width: 576, height: 395 }).toFile(path.join(clientAssets, 'admin-top-hero.jpg'));
  await sharp(img5).extract({ left: 0, top: 855, width: 576, height: 169 }).toFile(path.join(clientAssets, 'admin-bottom-bench.jpg'));

  // Copy server uploads to client assets
  const serverFiles = await fs.readdir(serverUploads);
  for (const sf of serverFiles) {
    await fs.copyFile(path.join(serverUploads, sf), path.join(clientAssets, sf));
  }

  console.log('✅ Re-extracted clean crops successfully!');
}

run().catch(console.error);
