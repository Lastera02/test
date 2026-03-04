import { api } from '../../lib/api';

export default async function AdminPage() {
  const products = await api<{items:any[]}>('/products?pageSize=20');
  return <main className="container py-6"><h1 className="text-2xl mb-4">Админ-панель</h1><table className="w-full bg-white border"><thead><tr><th className="border p-2">ID</th><th className="border p-2">Название</th><th className="border p-2">SKU</th><th className="border p-2">Цена</th></tr></thead><tbody>{products.items.map(p => <tr key={p.id}><td className="border p-2">{p.id}</td><td className="border p-2">{p.name}</td><td className="border p-2">{p.sku}</td><td className="border p-2">{p.price}</td></tr>)}</tbody></table></main>;
}
