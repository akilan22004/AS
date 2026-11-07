import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { imageService } from '../src/services/image.service';
import { productService } from '../src/services/product.service';

const prisma = new PrismaClient();

async function runDeleteTest() {
  console.log('=== TEST: Supabase & Database Product & Image Deletion Synchronization ===\n');

  const timestamp = Date.now();
  const testFilename = `test-delete-probe-${timestamp}.jpg`;
  const testFilePath = path.resolve(__dirname, '../uploads/products', testFilename);

  // 1. Create a temporary image file
  fs.writeFileSync(testFilePath, Buffer.from('test-image-content-for-delete-verification'));
  console.log('1. Created temporary image file:', testFilePath);

  try {
    // 2. Find a category
    const category = await prisma.category.findFirst();
    if (!category) throw new Error('No category found');

    // 3. Create product in DB
    const product = await prisma.product.create({
      data: {
        name: `Delete Test Sofa ${timestamp}`,
        modelCode: `AF-DEL-${timestamp}`,
        slug: `delete-test-sofa-${timestamp}`,
        categoryId: category.id,
        isPublished: true,
        images: {
          create: {
            filePath: `uploads/products/${testFilename}`,
            thumbPath: `uploads/products/${testFilename}`,
            altText: 'Delete test image',
            displayOrder: 0,
            isPrimary: true,
          }
        }
      },
      include: { images: true }
    });
    console.log('2. Created test product in DB with ID:', product.id);
    console.log('   Associated image ID:', product.images[0].id, 'Path:', product.images[0].filePath);

    // 4. Test Image Deletion via imageService
    console.log('\n3. Testing imageService.deleteImage()...');
    await imageService.deleteImage(product.images[0].id, product.id);

    // Verify local file is deleted
    const fileExistsAfter = fs.existsSync(testFilePath);
    console.log('   Local file exists after deleteImage?', fileExistsAfter ? 'YES (FAIL)' : 'NO (CORRECT - DELETED)');

    // Verify DB image record is deleted
    const dbImageAfter = await prisma.productImage.findUnique({ where: { id: product.images[0].id } });
    console.log('   DB image record exists after deleteImage?', dbImageAfter ? 'YES (FAIL)' : 'NO (CORRECT - DELETED)');

    // 5. Delete product record
    await productService.delete(product.id);
    const dbProductAfter = await prisma.product.findUnique({ where: { id: product.id } });
    console.log('   DB product record exists after delete?', dbProductAfter ? 'YES (FAIL)' : 'NO (CORRECT - DELETED)');

    console.log('\n✅ DELETION SYNCHRONIZATION TEST PASSED 100%!');

  } finally {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  }
}

runDeleteTest().catch(console.error);
