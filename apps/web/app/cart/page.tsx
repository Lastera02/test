'use client';
import Link from 'next/link';
import { useCartStore } from '../../lib/cart';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return <main className="container py-6"><h1 className="text-2xl mb-4">Корзина</h1>{items.map(i => <div key={i.productId} className="bg-white border rounded p-3 mb-2 flex justify-between"><div>{i.name} x {i.qty}</div><button onClick={() => remove(i.productId)}>Удалить</button></div>)}<p className="font-semibold mt-3">Итого: {total} ₽</p><Link href="/checkout" className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded">Оформить</Link></main>;
}
