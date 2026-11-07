import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Sofas', slug: 'sofas', description: 'Crafted for comfort, designed for life.', coverImage: '/assets/cat-sofas.jpg', displayOrder: 1 },
  { name: 'Beds', slug: 'beds', description: 'Restful spaces, crafted from solid wood.', coverImage: '/assets/cat-beds.jpg', displayOrder: 2 },
  { name: 'Dining Tables', slug: 'dining-tables', description: 'Bring people together over timeless design.', coverImage: '/assets/cat-dining.jpg', displayOrder: 3 },
  { name: 'Wardrobes', slug: 'wardrobes', description: 'Spacious, sturdy and elegantly crafted.', coverImage: '/assets/cat-wardrobes.jpg', displayOrder: 4 },
  { name: 'Chairs', slug: 'chairs', description: 'A perfect blend of comfort and craftsmanship.', coverImage: '/assets/cat-chairs.jpg', displayOrder: 5 },
  { name: 'TV Units', slug: 'tv-units', description: 'Stylish storage for your entertainment space.', coverImage: '/assets/cat-tv-units.jpg', displayOrder: 6 },
  { name: 'Dressing Tables', slug: 'dressing-tables', description: 'Elegance and utility in perfect harmony.', coverImage: '/assets/cat-dressing-tables.jpg', displayOrder: 7 },
  { name: 'Storage Cabinets', slug: 'storage-cabinets', description: 'Organized spaces with lasting strength.', coverImage: '/assets/cat-storage-cabinets.jpg', displayOrder: 8 },
];

async function main() {
  console.log('🌱 Seeding Annamalai Furniture database...');

  // 1. Categories
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, c.id);
  }
  console.log('✅ Categories seeded');

  // 3. Products
  const products = [
    {
      name: 'Handcrafted Wooden Sofa',
      modelCode: 'AF-SF001',
      slug: 'handcrafted-wooden-sofa',
      categorySlug: 'sofas',
      description: 'A timeless wooden sofa that blends traditional craftsmanship with modern comfort. Built from quality solid wood, it adds warmth, elegance and lasting style to your living space.',
      material: 'Solid Teak Wood & Premium Linen Fabric',
      length: 215,
      width: 88,
      height: 84,
      dimensionUnit: 'cm',
      specifications: 'Hand carved floral motifs on armrests and base; high density foam cushioning; natural walnut polish finish.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-detail-sofa-main.jpg', isPrimary: true, altText: 'Handcrafted Wooden Sofa Main' },
        { filePath: 'uploads/products/p-detail-thumb-1.jpg', isPrimary: false, altText: 'Handcrafted Wooden Sofa Full View' },
        { filePath: 'uploads/products/p-detail-thumb-2.jpg', isPrimary: false, altText: 'Handcrafted Wooden Sofa Armrest Carving' },
        { filePath: 'uploads/products/p-detail-thumb-3.jpg', isPrimary: false, altText: 'Intricate Wood Carving Detail' },
        { filePath: 'uploads/products/p-detail-thumb-4.jpg', isPrimary: false, altText: 'Premium Linen Fabric Upholstery' },
      ],
    },
    {
      name: 'Classic Wooden Sofa',
      modelCode: 'AF-SF002',
      slug: 'classic-wooden-sofa',
      categorySlug: 'sofas',
      description: 'A timeless wooden sofa with elegant design and lasting comfort. Designed for gracious living rooms.',
      material: 'Solid Teak Wood',
      length: 200,
      width: 85,
      height: 82,
      dimensionUnit: 'cm',
      specifications: 'Solid wood frame with slatted sides and high resilience cushions.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-classic-sofa.jpg', isPrimary: true, altText: 'Classic Wooden Sofa' },
      ],
    },
    {
      name: 'Carved Wooden Sofa',
      modelCode: 'AF-SF003',
      slug: 'carved-wooden-sofa',
      categorySlug: 'sofas',
      description: 'Exquisitely carved 3-seater sofa with traditional South Indian architectural flourishes and crest detailing.',
      material: 'Solid Rosewood',
      length: 210,
      width: 90,
      height: 95,
      dimensionUnit: 'cm',
      specifications: 'Ornate crown carving, deep button-tufted back cushions, heritage finish.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-like-2.jpg', isPrimary: true, altText: 'Carved Wooden Sofa' },
      ],
    },
    {
      name: 'Modern Wooden Sofa',
      modelCode: 'AF-SF004',
      slug: 'modern-wooden-sofa',
      categorySlug: 'sofas',
      description: 'Clean Scandinavian lines paired with the timeless warmth of natural solid timber.',
      material: 'Solid Sheesham Wood',
      length: 195,
      width: 82,
      height: 78,
      dimensionUnit: 'cm',
      specifications: 'Low-profile silhouette, tailored cushions, smooth wax finish.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-like-3.jpg', isPrimary: true, altText: 'Modern Wooden Sofa' },
      ],
    },
    {
      name: 'Royal Carved Bed',
      modelCode: 'AF-BD001',
      slug: 'royal-carved-bed',
      categorySlug: 'beds',
      description: 'Opulent king-size solid teak bed with intricate hand-carved floral crown, robust corner posts and reinforced slat foundation.',
      material: 'Solid Grade-A Teak Wood',
      length: 215,
      width: 198,
      height: 145,
      dimensionUnit: 'cm',
      specifications: 'King Size 78x72 inch mattress; solid wood side rails; multi-coat lacquer finish.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-royal-carved-bed.jpg', isPrimary: true, altText: 'Royal Carved Bed' },
      ],
    },
    {
      name: 'Premium Wooden Bed',
      modelCode: 'AF-BD002',
      slug: 'premium-wooden-bed',
      categorySlug: 'beds',
      description: 'A sturdy and stylish bed crafted from quality solid wood with arched fluted headboard and matching nightstands.',
      material: 'Solid Teak Wood',
      length: 208,
      width: 192,
      height: 120,
      dimensionUnit: 'cm',
      specifications: 'King Size 78x72 mattress fit; reinforced slats; antique polish.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-premium-bed.jpg', isPrimary: true, altText: 'Premium Wooden Bed' },
      ],
    },
    {
      name: 'Modern Teak Bed',
      modelCode: 'AF-BD003',
      slug: 'modern-teak-bed',
      categorySlug: 'beds',
      description: 'Contemporary low-profile solid teak bed designed with clean architectural geometry and built-in headboard ledge.',
      material: 'Solid Teak Wood',
      length: 205,
      width: 188,
      height: 98,
      dimensionUnit: 'cm',
      specifications: 'Queen Size 78x60 mattress fit; concealed heavy-duty center support legs.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-modern-teak-bed.jpg', isPrimary: true, altText: 'Modern Teak Bed' },
      ],
    },
    {
      name: 'Hydraulic Storage Bed',
      modelCode: 'AF-BD004',
      slug: 'storage-bed',
      categorySlug: 'beds',
      description: 'Effortless pneumatic lift-up wooden storage bed offering expansive dust-free under-bed compartment for extra quilts and linens.',
      material: 'Solid Teak & Marine Grade Ply Substructure',
      length: 210,
      width: 192,
      height: 115,
      dimensionUnit: 'cm',
      specifications: 'German-engineered pneumatic pistons; partition dividers; 78x72 inch king mattress base.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-storage-bed.jpg', isPrimary: true, altText: 'Storage Bed' },
      ],
    },
    {
      name: 'Royal Canopy Bed',
      modelCode: 'AF-BD005',
      slug: 'canopy-bed',
      categorySlug: 'beds',
      description: 'Four-poster architectural canopy bed crafted from solid teak wood, bringing grandeur and traditional luxury into modern estates.',
      material: 'Solid Teak Wood',
      length: 218,
      width: 200,
      height: 220,
      dimensionUnit: 'cm',
      specifications: 'Turned wood posts; top cross beams for optional sheer drapery; hand-rubbed oil finish.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-canopy-bed.jpg', isPrimary: true, altText: 'Canopy Bed' },
      ],
    },
    {
      name: '6-Seater Dining Set',
      modelCode: 'AF-DN003',
      slug: '6-seater-dining-set',
      categorySlug: 'dining-tables',
      description: 'A beautifully crafted dining set for memorable moments, featuring a substantial solid wood tabletop and 6 ergonomically curved chairs.',
      material: 'Solid Sheesham Wood',
      length: 180,
      width: 95,
      height: 76,
      dimensionUnit: 'cm',
      specifications: 'Includes 1 dining table and 6 upholstered high-back chairs.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-dining-set.jpg', isPrimary: true, altText: '6-Seater Dining Set' },
      ],
    },
    {
      name: 'Wooden Wardrobe',
      modelCode: 'AF-WR004',
      slug: 'wooden-wardrobe',
      categorySlug: 'wardrobes',
      description: 'Spacious, durable and elegantly designed for modern homes. 4-door construction with bottom storage drawers.',
      material: 'Solid Teak Wood & Plywood Shelving',
      length: 190,
      width: 60,
      height: 210,
      dimensionUnit: 'cm',
      specifications: 'Brass handles, internal hanging rod, multi-tier shelving, bottom accessory drawers.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-wardrobe.jpg', isPrimary: true, altText: 'Wooden Wardrobe' },
      ],
    },
    {
      name: 'Handcrafted Teak Armchair',
      modelCode: 'AF-CH007',
      slug: 'handcrafted-teak-armchair',
      categorySlug: 'chairs',
      description: 'Comfortable accent armchair with cane rattan weave backing, tapered teak legs and plush ivory cushions.',
      material: 'Solid Teak Wood & Natural Cane Weave',
      length: 75,
      width: 78,
      height: 82,
      dimensionUnit: 'cm',
      specifications: 'Hand-woven natural cane backrest, high-density foam seat, ergonomic recline angle.',
      isFeatured: true,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-accent-chair.jpg', isPrimary: true, altText: 'Handcrafted Teak Armchair' },
      ],
    },
    {
      name: 'Premium TV Unit',
      modelCode: 'AF-TV005',
      slug: 'premium-tv-unit',
      categorySlug: 'tv-units',
      description: 'A stylish and functional unit for your entertainment space with media console shelves and deep drawers.',
      material: 'Solid Teak Wood',
      length: 180,
      width: 45,
      height: 52,
      dimensionUnit: 'cm',
      specifications: 'Cable management grommets, soft-close hardware, 4 spacious drawers.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-tv-unit.jpg', isPrimary: true, altText: 'Premium TV Unit' },
      ],
    },
    {
      name: 'Dressing Table',
      modelCode: 'AF-DT006',
      slug: 'dressing-table',
      categorySlug: 'dressing-tables',
      description: 'A refined dressing table with ample storage, large arched triple-view mirror and classic stool.',
      material: 'Solid Wood & Silver-Coated Glass',
      length: 120,
      width: 48,
      height: 185,
      dimensionUnit: 'cm',
      specifications: 'Includes cushioned stool, 6 side drawers, central accessory drawer.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-dressing-table.jpg', isPrimary: true, altText: 'Dressing Table' },
      ],
    },
    {
      name: 'Heritage Storage Cabinet',
      modelCode: 'AF-SC008',
      slug: 'heritage-storage-cabinet',
      categorySlug: 'storage-cabinets',
      description: 'Multipurpose solid wood sideboard storage cabinet with louvered double doors, adjustable shelves and antique brass latch hardware.',
      material: 'Solid Teak Wood',
      length: 135,
      width: 46,
      height: 96,
      dimensionUnit: 'cm',
      specifications: '2 large enclosed cabinets, interior adjustable shelf, solid wood top surface.',
      isFeatured: false,
      isPublished: true,
      images: [
        { filePath: 'uploads/products/p-storage-cabinet.jpg', isPrimary: true, altText: 'Heritage Storage Cabinet' },
      ],
    },
  ];

  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) continue;

    const { images, categorySlug: _, ...prodData } = p;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    let prodId = existing?.id;

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { ...prodData, categoryId },
      });
    } else {
      const created = await prisma.product.create({
        data: { ...prodData, categoryId },
      });
      prodId = created.id;
    }

    if (prodId) {
      await prisma.productImage.deleteMany({ where: { productId: prodId } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: prodId,
            filePath: images[i].filePath,
            thumbPath: images[i].filePath,
            altText: images[i].altText,
            displayOrder: i,
            isPrimary: images[i].isPrimary,
          },
        });
      }
    }
  }
  console.log('✅ Products & Product Images seeded');

  // 4. Default Website Settings
  const settings = [
    { key: 'businessName', value: 'Annamalai Furniture' },
    { key: 'tagline', value: 'The Art of Wood — Handcrafted Luxury' },
    { key: 'whatsappEnabled', value: 'false' },
    { key: 'whatsappNumber', value: '' },
    { key: 'aboutContent', value: 'Annamalai Furniture brings you handcrafted wooden furniture that blends traditional South Indian craftsmanship with modern comfort and durability.' },
    { key: 'contactEmail', value: 'contact@annamalaifurniture.com' },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Website settings seeded');
  console.log('🎉 Database seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
