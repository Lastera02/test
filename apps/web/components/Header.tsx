'use client';
import Link from 'next/link';
import { useCartStore } from '../lib/cart';

export default function Header() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  return <header className="bg-white border-b"><div className="container py-4 flex justify-between"><Link href="/" className="font-bold">AutoParts MVP</Link><nav className="flex gap-4"><Link href="/catalog">Каталог</Link><Link href="/profile">Профиль</Link><Link href="/admin">Админ</Link><Link href="/cart">Корзина ({count})</Link></nav></div></header>;
}
