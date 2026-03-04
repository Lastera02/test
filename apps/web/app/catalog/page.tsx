import Link from 'next/link';
import { api } from '../../lib/api';

export default async function CatalogPage({ searchParams }: { searchParams: Record<string, string> }) {
  const qs = new URLSearchParams(searchParams).toString();
  const data = await api<{ items: any[] }>(`/products?${qs}`);
  return <main className="container py-6"><h1 className="text-2xl font-semibold mb-4">Каталог</h1><div className="grid md:grid-cols-3 gap-4">{data.items.map(p => <Link key={p.id} href={`/product/${p.slug}`} className="bg-white p-3 rounded border"><img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover"/><h3 className="font-medium mt-2">{p.name}</h3><p>{p.price} ₽</p></Link>)}</div></main>;
}
