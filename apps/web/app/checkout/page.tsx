'use client';
import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import { useCartStore } from '../../lib/cart';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [msg, setMsg] = useState('');
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries()) as any;
    payload.items = items.map((i) => ({ productId: i.productId, qty: i.qty }));
    await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
    clear();
    setMsg('Заказ создан');
  };
  return <main className="container py-6"><h1 className="text-2xl">Оформление заказа</h1><form onSubmit={submit} className="grid gap-2 max-w-lg mt-4">{['customerName','phone','city','address','comment'].map(n => <input key={n} name={n} placeholder={n} className="border p-2 rounded"/>)}<select name="deliveryType" className="border p-2 rounded"><option value="pickup">Самовывоз</option><option value="cdek">СДЭК</option><option value="post">Почта</option></select><select name="paymentType" className="border p-2 rounded"><option value="cash">Наличные</option><option value="card">Карта</option></select><button className="bg-blue-600 text-white py-2 rounded">Подтвердить</button></form><p>{msg}</p></main>;
}
