const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('--- Most Recent 5 Products in SQLite ---');
  for (const p of products) {
    console.log('Product:', p.name, '(', p.slug, ') | Images:', p.images.length);
    for (const img of p.images) {
      console.log('  - Image:', img.id, '| filePath:', img.filePath, '| isPrimary:', img.isPrimary);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
