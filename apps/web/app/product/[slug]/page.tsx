import { Metadata } from 'next';
import { api } from '../../../lib/api';
import AddToCartButton from '../../../components/AddToCartButton';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `${params.slug} | AutoParts`, description: 'Карточка товара автозапчасти' };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await api<any>(`/products/slug/${params.slug}`);
  if (!product) return <main className="container py-6">Товар не найден</main>;
  return <main className="container py-6"><h1 className="text-2xl">{product.name}</h1><img src={product.imageUrl} alt={product.name} className="w-full max-w-xl my-4"/><p>{product.description}</p><p className="text-xl mt-2">{product.price} ₽</p><AddToCartButton product={{ id: product.id, name: product.name, price: Number(product.price) }} /></main>;
}
