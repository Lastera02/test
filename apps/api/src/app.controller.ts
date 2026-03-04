import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { CartAddDto, CartRemoveDto, CreateOrderDto, LoginDto, RegisterDto, AdminProductDto, UpdateOrderStatusDto } from './dto';
import { CurrentUser, JwtAuthGuard, OptionalJwtGuard, RolesGuard } from './auth';
import { PrismaService } from './prisma.service';

@ApiTags('api')
@Controller()
export class AppController {
  constructor(private service: AppService, private prisma: PrismaService) {}

  @Post('auth/register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.service.register(dto.email, dto.password);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken: tokens.accessToken };
  }

  @Post('auth/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.service.login(dto.email, dto.password);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken: tokens.accessToken };
  }

  @Post('auth/refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.service.refresh((req.cookies as any).refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken: tokens.accessToken };
  }

  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { ok: true };
  }

  @Get('products') products(@Query() query: Record<string, unknown>) { return this.service.products(query); }
  @Get('products/:id') product(@Param('id', ParseIntPipe) id: number) { return this.service.getProduct(id); }
  @Get('products/slug/:slug') productBySlug(@Param('slug') slug: string) { return this.service.getProductBySlug(slug); }
  @Get('categories') categories() { return this.service.categories(); }
  @Get('brands') brands() { return this.service.brands(); }
  @Get('cars/brands') carBrands() { return this.service.carBrands(); }
  @Get('cars/models') carModels(@Query('brand') brand: string) { return this.service.carModels(brand); }
  @Get('cars/years') carYears(@Query('brand') brand: string, @Query('model') model: string) { return this.service.carYears(brand, model); }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { id: number; email: string; role: string }) { return user; }

  @ApiBearerAuth()
  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: { id: number }) { return this.prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }); }

  @UseGuards(OptionalJwtGuard)
  @Post('cart/add')
  add(@Body() dto: CartAddDto, @CurrentUser() user: any) {
    if (!user?.id && !dto.sessionId) throw new BadRequestException('sessionId is required for guest cart');
    return this.service.addToCart(user?.id ?? null, dto.sessionId, dto.productId, dto.qty);
  }

  @UseGuards(OptionalJwtGuard)
  @Post('cart/remove')
  remove(@Body() dto: CartRemoveDto, @CurrentUser() user: any) {
    if (!user?.id && !dto.sessionId) throw new BadRequestException('sessionId is required for guest cart');
    return this.service.removeFromCart(user?.id ?? null, dto.sessionId, dto.productId);
  }

  @UseGuards(OptionalJwtGuard)
  @Get('cart')
  cart(@Query('sessionId') sessionId: string, @CurrentUser() user: any) {
    if (!user?.id && !sessionId) throw new BadRequestException('sessionId is required for guest cart');
    return this.service.getCart(user?.id ?? null, sessionId);
  }

  @UseGuards(OptionalJwtGuard)
  @Post('orders')
  order(@Body() dto: CreateOrderDto, @CurrentUser() user: any) { return this.service.createOrder(user?.id ?? null, dto); }

  @Get('orders/:id') orderById(@Param('id', ParseIntPipe) id: number) { return this.prisma.order.findUnique({ where: { id }, include: { items: true } }); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/products') createProduct(@Body() dto: AdminProductDto) { return this.prisma.product.create({ data: { ...dto, specsJson: {} } }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/products/:id') updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminProductDto) { return this.prisma.product.update({ where: { id }, data: { ...dto } }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/products/:id') deleteProduct(@Param('id', ParseIntPipe) id: number) { return this.prisma.product.delete({ where: { id } }); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/categories') createCategory(@Body() dto: { name: string; slug: string }) { return this.prisma.category.create({ data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/categories/:id') updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: { name: string; slug: string }) { return this.prisma.category.update({ where: { id }, data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/categories/:id') deleteCategory(@Param('id', ParseIntPipe) id: number) { return this.prisma.category.delete({ where: { id } }); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/brands') createBrand(@Body() dto: { name: string; slug: string }) { return this.prisma.brand.create({ data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/brands/:id') updateBrand(@Param('id', ParseIntPipe) id: number, @Body() dto: { name: string; slug: string }) { return this.prisma.brand.update({ where: { id }, data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/brands/:id') deleteBrand(@Param('id', ParseIntPipe) id: number) { return this.prisma.brand.delete({ where: { id } }); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/cars') createCar(@Body() dto: { brandId: number; name: string; slug: string }) { return this.prisma.carModel.create({ data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/cars/:id') updateCar(@Param('id', ParseIntPipe) id: number, @Body() dto: { name: string; slug: string }) { return this.prisma.carModel.update({ where: { id }, data: dto }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin/cars/:id') deleteCar(@Param('id', ParseIntPipe) id: number) { return this.prisma.carModel.delete({ where: { id } }); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/orders') adminOrders() { return this.prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin/orders/:id') adminOrderUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.prisma.order.update({ where: { id }, data: { status: dto.status } });
  }
}
