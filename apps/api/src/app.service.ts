import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { productFilterSchema } from '@autoparts/shared';
import { PrismaService } from './prisma.service';
import { CreateOrderDto } from './dto';


export function buildProductQuery(query: any) {
  const where: any = {
    AND: [
      query.q ? { OR: [{ name: { contains: query.q, mode: 'insensitive' } }, { sku: { contains: query.q, mode: 'insensitive' } }, { brand: { name: { contains: query.q, mode: 'insensitive' } } }] } : {},
      query.category ? { category: { slug: query.category } } : {},
      query.brand ? { brand: { slug: query.brand } } : {},
      query.inStock ? { stockQty: { gt: 0 } } : {},
      query.priceFrom ? { price: { gte: query.priceFrom } } : {},
      query.priceTo ? { price: { lte: query.priceTo } } : {},
      query.carId ? { compatibilities: { some: { carModelId: query.carId } } } : {}
    ]
  };
  const orderBy: any = query.sort === 'priceAsc' ? { price: 'asc' } : query.sort === 'priceDesc' ? { price: 'desc' } : { createdAt: 'desc' };
  return { where, orderBy };
}

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string) {
    const hash = await argon2.hash(password);
    const user = await this.prisma.user.create({ data: { email, passwordHash: hash } });
    return this.issueTokens(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.role);
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh' }) as { sub: number; role: UserRole };
    return this.issueTokens(payload.sub, payload.role);
  }

  private async issueTokens(userId: number, role: UserRole) {
    const accessToken = await this.jwt.signAsync({ sub: userId, role }, { secret: process.env.JWT_ACCESS_SECRET || 'dev_access', expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
    const refreshToken = await this.jwt.signAsync({ sub: userId, role }, { secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh', expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken } });
    return { accessToken, refreshToken };
  }

  async products(rawQuery: Record<string, unknown>) {
    const query = productFilterSchema.parse(rawQuery);
    const { where, orderBy } = buildProductQuery(query);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ where, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { brand: true, category: true } }),
      this.prisma.product.count({ where })
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  getProduct(id: number) { return this.prisma.product.findUnique({ where: { id }, include: { brand: true, category: true, compatibilities: { include: { carModel: true } } } }); }
  getProductBySlug(slug: string) { return this.prisma.product.findUnique({ where: { slug }, include: { brand: true, category: true, compatibilities: { include: { carModel: true } } } }); }
  categories() { return this.prisma.category.findMany(); }
  brands() { return this.prisma.brand.findMany(); }
  carBrands() { return this.prisma.carBrand.findMany(); }
  carModels(brandSlug: string) { return this.prisma.carModel.findMany({ where: { brand: { slug: brandSlug } } }); }
  async carYears(brandSlug: string, modelSlug: string) {
    const model = await this.prisma.carModel.findFirst({ where: { slug: modelSlug, brand: { slug: brandSlug } }, include: { generations: true } });
    if (!model) return [];
    if (model.generations.length) return model.generations;
    return [{ yearFrom: 2000, yearTo: new Date().getFullYear() }];
  }

  async addToCart(userId: number | null, sessionId: string | undefined, productId: number, qty: number) {
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id: productId } });
    const cart = await this.prisma.cart.upsert({ where: userId ? { userId } : { sessionId: sessionId! }, update: {}, create: { userId: userId ?? undefined, sessionId } });
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { qty: { increment: qty } },
      create: { cartId: cart.id, productId, qty, priceSnapshot: product.price }
    });
    return this.getCart(userId, sessionId);
  }

  async removeFromCart(userId: number | null, sessionId: string | undefined, productId: number) {
    const cart = await this.getCartEntity(userId, sessionId);
    if (!cart) return { items: [] };
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.getCart(userId, sessionId);
  }

  async getCart(userId: number | null, sessionId: string | undefined) {
    const cart = await this.getCartEntity(userId, sessionId);
    if (!cart) return { items: [], total: 0 };
    const items = await this.prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: true } });
    const total = items.reduce((sum: number, i: any) => sum + Number(i.priceSnapshot) * i.qty, 0);
    return { items, total };
  }

  private getCartEntity(userId: number | null, sessionId: string | undefined) { return this.prisma.cart.findFirst({ where: userId ? { userId } : { sessionId } }); }

  async createOrder(userId: number | null, dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({ where: { id: { in: dto.items.map(i => i.productId) } } });
    const total = dto.items.reduce((sum, item) => {
      const p = products.find((pp: any) => pp.id === item.productId)!;
      return sum + Number(p.price) * item.qty;
    }, 0);

    return this.prisma.order.create({
      data: {
        userId: userId ?? undefined,
        totalPrice: total,
        customerName: dto.customerName,
        phone: dto.phone,
        city: dto.city,
        address: dto.address,
        deliveryType: dto.deliveryType,
        paymentType: dto.paymentType,
        comment: dto.comment,
        items: { create: dto.items.map(i => {
          const p = products.find((pp: any) => pp.id === i.productId)!;
          return { productId: p.id, nameSnapshot: p.name, skuSnapshot: p.sku, priceSnapshot: p.price, qty: i.qty };
        }) }
      },
      include: { items: true }
    });
  }
}
