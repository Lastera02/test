import { AppService } from '../src/app.service';

describe('Orders integration', () => {
  it('creates order with snapshots and total', async () => {
    const prisma: any = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, name: 'Фильтр', sku: 'SKU-1', price: 500 }
        ])
      },
      order: {
        create: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 10, ...data }))
      },
      user: { update: jest.fn() }
    };
    const jwt: any = { signAsync: jest.fn(), verify: jest.fn() };
    const service = new AppService(prisma, jwt);

    const order = await service.createOrder(null, {
      customerName: 'Иван Иванов',
      phone: '+79991234567',
      city: 'Москва',
      address: 'ул. Пушкина 1',
      deliveryType: 'pickup',
      paymentType: 'cash',
      comment: 'без звонка',
      items: [{ productId: 1, qty: 2 }]
    });

    expect(order.id).toBe(10);
    expect(order.totalPrice).toBe(1000);
    expect(prisma.order.create).toHaveBeenCalled();
  });
});
