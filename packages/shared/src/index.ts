import { z } from 'zod';

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  carId: z.coerce.number().optional(),
  priceFrom: z.coerce.number().optional(),
  priceTo: z.coerce.number().optional(),
  sort: z.enum(['priceAsc', 'priceDesc', 'new']).optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(12)
});

export type ProductFilters = z.infer<typeof productFilterSchema>;

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stockQty: number;
  imageUrl: string;
  description: string;
  brand: { id: number; name: string; slug: string };
  category: { id: number; name: string; slug: string };
};
