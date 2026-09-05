"use client";
import { useState, useEffect } from "react";

export interface WishlistProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  moq?: number;
}

const KEY = "kelikuli-wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (product: WishlistProduct) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const remove = (id: number) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const isWished = (id: number) => items.some((p) => p.id === id);

  return { items, toggle, remove, isWished, count: items.length };
}
