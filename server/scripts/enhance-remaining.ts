import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const destDir = 'C:/Users/Welcome/Downloads/AM/client/public/assets';

async function enhanceRemaining() {
  const list = [
    'cat-dressing-tables.jpg',
    'cat-card-dressing.jpg',
    'p-dressing-table.jpg',
    'cat-storage-cabinets.jpg',
    'craft-artisan.jpg',
    'craft-artisan-senior.jpg',
    'craft-dovetail-joint.jpg',
    'about-wood-blocks.jpg',
    'about-wood-rings.jpg',
    'p-canopy-bed.jpg',
    'p-modern-teak-bed.jpg',
    'p-storage-bed.jpg',
  ];

  for (const f of list) {
    const p = path.join(destDir, f);
    try {
      const inputBuffer = fs.readFileSync(p);
      const outputBuffer = await sharp(inputBuffer)
        .resize({ width: 600, height: 400, fit: 'inside', kernel: 'lanczos3' })
        .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
        .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
        .toBuffer();
      fs.writeFileSync(p, outputBuffer);
      console.log(`Successfully enhanced ${f}`);
    } catch (e: any) {
      console.log(`Error ${f}: ${e.message}`);
    }
  }
}

enhanceRemaining().catch(console.error);
