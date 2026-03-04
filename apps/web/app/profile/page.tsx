import { api } from '../../lib/api';

export default async function ProfilePage() {
  let orders: any[] = [];
  try { orders = await api('/me/orders'); } catch {}
  return <main className="container py-6"><h1 className="text-2xl mb-4">Личный кабинет</h1><h2 className="font-semibold">История заказов</h2>{orders.map(o => <div key={o.id} className="border bg-white rounded p-2 mt-2">Заказ #{o.id} — {o.status} — {o.totalPrice} ₽</div>)}{!orders.length && <p>Пока нет заказов или требуется вход.</p>}</main>;
}
