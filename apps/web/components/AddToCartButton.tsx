'use client';
import { useCartStore } from '../lib/cart';

export default function AddToCartButton({ product }: { product: { id: number; name: string; price: number } }) {
  const add = useCartStore((s) => s.add);
  return <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => add({ productId: product.id, qty: 1, name: product.name, price: product.price })}>В корзину</button>;
}
