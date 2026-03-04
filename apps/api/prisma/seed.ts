import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const [engine, suspension, brakes] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'engine' }, update: {}, create: { name: 'Двигатель', slug: 'engine' } }),
    prisma.category.upsert({ where: { slug: 'suspension' }, update: {}, create: { name: 'Подвеска', slug: 'suspension' } }),
    prisma.category.upsert({ where: { slug: 'brakes' }, update: {}, create: { name: 'Тормоза', slug: 'brakes' } })
  ]);

  const [lada, gaz, hyundai] = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'lada' }, update: {}, create: { name: 'LADA', slug: 'lada' } }),
    prisma.brand.upsert({ where: { slug: 'gaz' }, update: {}, create: { name: 'ГАЗ', slug: 'gaz' } }),
    prisma.brand.upsert({ where: { slug: 'hyundai-kia' }, update: {}, create: { name: 'Hyundai/Kia', slug: 'hyundai-kia' } })
  ]);

  const ladaBrand = await prisma.carBrand.upsert({ where: { slug: 'lada' }, update: {}, create: { name: 'LADA', slug: 'lada' } });
  const uazBrand = await prisma.carBrand.upsert({ where: { slug: 'uaz' }, update: {}, create: { name: 'УАЗ', slug: 'uaz' } });

  const vesta = await prisma.carModel.upsert({
    where: { brandId_slug: { brandId: ladaBrand.id, slug: 'vesta' } },
    update: {},
    create: { brandId: ladaBrand.id, name: 'Vesta', slug: 'vesta' }
  });
  const patriot = await prisma.carModel.upsert({
    where: { brandId_slug: { brandId: uazBrand.id, slug: 'patriot' } },
    update: {},
    create: { brandId: uazBrand.id, name: 'Patriot', slug: 'patriot' }
  });

  const p1 = await prisma.product.upsert({
    where: { sku: 'LADA-FLT-001' },
    update: {},
    create: {
      name: 'Фильтр масляный LADA', slug: 'filtr-maslyanyj-lada', sku: 'LADA-FLT-001',
      brandId: lada.id, categoryId: engine.id, price: 450, stockQty: 33,
      imageUrl: 'https://placehold.co/600x400?text=Oil+Filter', description: 'Оригинальный масляный фильтр',
      specsJson: { material: 'целлюлоза' }
    }
  });

  await prisma.product.upsert({
    where: { sku: 'GAZ-BRK-100' },
    update: {},
    create: {
      name: 'Колодки тормозные ГАЗ', slug: 'kolodki-tormoznye-gaz', sku: 'GAZ-BRK-100',
      brandId: gaz.id, categoryId: brakes.id, price: 2100, stockQty: 8,
      imageUrl: 'https://placehold.co/600x400?text=Brake+Pads', description: 'Комплект передних тормозных колодок',
      specsJson: { axle: 'front' }
    }
  });

  await prisma.product.upsert({
    where: { sku: 'HYU-SUS-010' },
    update: {},
    create: {
      name: 'Амортизатор Hyundai/Kia', slug: 'amortizator-hyundai-kia', sku: 'HYU-SUS-010',
      brandId: hyundai.id, categoryId: suspension.id, price: 3900, stockQty: 15,
      imageUrl: 'https://placehold.co/600x400?text=Shock+Absorber', description: 'Задний амортизатор',
      specsJson: { side: 'rear' }
    }
  });

  await prisma.productCompatibility.upsert({
    where: { productId_carModelId: { productId: p1.id, carModelId: vesta.id } },
    update: {}, create: { productId: p1.id, carModelId: vesta.id, yearFrom: 2015, yearTo: 2025 }
  });
  await prisma.productCompatibility.upsert({
    where: { productId_carModelId: { productId: p1.id, carModelId: patriot.id } },
    update: {}, create: { productId: p1.id, carModelId: patriot.id, yearFrom: 2017, yearTo: 2025 }
  });

  const adminHash = await argon2.hash('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash: adminHash, role: UserRole.ADMIN }
  });
}

main().finally(() => prisma.$disconnect());
