import Link from 'next/link';
export default function HomePage() { return <main className="container py-8"><h1 className="text-3xl font-semibold">Онлайн-магазин автозапчастей</h1><p className="mt-3">Подбор по марке/модели, каталог и заказ в пару кликов.</p><Link href="/catalog" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">Перейти в каталог</Link></main>; }
