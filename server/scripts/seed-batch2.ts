import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bedCat = await prisma.category.findUnique({ where: { slug: 'beds' } });
  if (!bedCat) {
    console.error('Beds category not found');
    return;
  }

  const newBeds = [
    {
      name: 'Royal Carved Bed',
      modelCode: 'AF-BD001',
      slug: 'royal-carved-bed',
      categoryId: bedCat.id,
      description: 'Handcrafted solid teak bed featuring intricate South Indian floral relief carvings on both the headboard and footboard.',
      material: 'Solid Teak Wood',
      length: 215,
      width: 195,
      height: 140,
      dimensionUnit: 'cm',
      specifications: 'King Size 78x72; hand-carved floral crown; reinforced platform base; heritage natural teak polish.',
      isFeatured: true,
      isPublished: true,
      image: 'uploads/products/p-royal-carved-bed.jpg',
    },
    {
      name: 'Modern Teak Bed',
      modelCode: 'AF-BD003',
      slug: 'modern-teak-bed',
      categoryId: bedCat.id,
      description: 'Clean contemporary silhouette with slatted headboard, rounded posts and natural warm timber grain.',
      material: 'Solid Teak Wood',
      length: 205,
      width: 185,
      height: 110,
      dimensionUnit: 'cm',
      specifications: 'Queen Size 78x60; slatted headboard; acoustic silent slat joints; matte wax seal.',
      isFeatured: true,
      isPublished: true,
      image: 'uploads/products/p-modern-teak-bed.jpg',
    },
    {
      name: 'Storage Bed',
      modelCode: 'AF-BD004',
      slug: 'storage-bed',
      categoryId: bedCat.id,
      description: 'Heavy duty hydraulic lift storage bed offering voluminous dust-free under-bed storage without sacrificing aesthetics.',
      material: 'Solid Sheesham Wood & Marine Ply Storage Deck',
      length: 210,
      width: 190,
      height: 115,
      dimensionUnit: 'cm',
      specifications: 'German hydraulic gas pistons; dual mattress lifters; compartmentalized bottom storage.',
      isFeatured: false,
      isPublished: true,
      image: 'uploads/products/p-storage-bed.jpg',
    },
    {
      name: 'Canopy Bed',
      modelCode: 'AF-BD005',
      slug: 'canopy-bed',
      categoryId: bedCat.id,
      description: 'Four-poster architectural canopy bed crafted from select solid teak with turned finials and sheer drapery rails.',
      material: 'Solid Teak Wood',
      length: 218,
      width: 198,
      height: 220,
      dimensionUnit: 'cm',
      specifications: 'Four turned corner posts; top canopy rail structure; mortise-and-tenon heirloom joinery.',
      isFeatured: false,
      isPublished: true,
      image: 'uploads/products/p-canopy-bed.jpg',
    },
  ];

  for (const b of newBeds) {
    const { image, ...bData } = b;
    const existing = await prisma.product.findUnique({ where: { slug: b.slug } });
    let pId = existing?.id;

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: bData });
    } else {
      const created = await prisma.product.create({ data: bData });
      pId = created.id;
    }

    if (pId) {
      await prisma.productImage.deleteMany({ where: { productId: pId } });
      await prisma.productImage.create({
        data: {
          productId: pId,
          filePath: image,
          thumbPath: image,
          altText: b.name,
          displayOrder: 0,
          isPrimary: true,
        },
      });
    }
  }

  console.log('✅ Batch 2 bed products seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
