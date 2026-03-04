import { buildProductQuery } from './app.service';

describe('buildProductQuery', () => {
  it('builds text search condition', () => {
    const q = buildProductQuery({ q: 'lada' });
    expect(q.where.AND[0].OR).toBeDefined();
  });

  it('builds inStock filter', () => {
    const q = buildProductQuery({ inStock: true });
    expect(q.where.AND[3]).toEqual({ stockQty: { gt: 0 } });
  });

  it('builds price sort', () => {
    const q = buildProductQuery({ sort: 'priceAsc' });
    expect(q.orderBy).toEqual({ price: 'asc' });
  });
});
