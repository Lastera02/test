import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class RegisterDto { @IsEmail() email!: string; @IsString() password!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }

export class CartAddDto { @IsInt() productId!: number; @IsInt() @Min(1) qty!: number; @IsOptional() @IsString() sessionId?: string; }
export class CartRemoveDto { @IsInt() productId!: number; @IsOptional() @IsString() sessionId?: string; }

export class OrderItemDto { @IsInt() productId!: number; @IsInt() @Min(1) qty!: number; }

export class CreateOrderDto {
  @IsString() customerName!: string;
  @IsString() phone!: string;
  @IsString() city!: string;
  @IsString() address!: string;
  @IsString() deliveryType!: string;
  @IsString() paymentType!: string;
  @IsOptional() @IsString() comment?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items!: OrderItemDto[];
}

export class AdminProductDto {
  @IsString() name!: string; @IsString() slug!: string; @IsString() sku!: string;
  @IsInt() brandId!: number; @IsInt() categoryId!: number; @IsInt() price!: number;
  @IsInt() stockQty!: number; @IsString() imageUrl!: string; @IsString() description!: string;
}

export class UpdateOrderStatusDto { @IsEnum(['NEW', 'PAID', 'SHIPPED', 'DONE', 'CANCELED']) status!: 'NEW'|'PAID'|'SHIPPED'|'DONE'|'CANCELED'; }
