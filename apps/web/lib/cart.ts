'use client';
import { create } from 'zustand';

type State = { items: { productId: number; qty: number; name: string; price: number }[]; add: (item: State['items'][0]) => void; remove: (productId: number) => void; clear: () => void; };

export const useCartStore = create<State>((set) => ({
  items: [],
  add: (item) => set((s) => {
    const exists = s.items.find((i) => i.productId === item.productId);
    if (exists) return { items: s.items.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i) };
    return { items: [...s.items, item] };
  }),
  remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  clear: () => set({ items: [] })
}));
