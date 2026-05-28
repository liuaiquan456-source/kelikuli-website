"use client";
import { useState, useEffect } from "react";

export interface CartProduct {
  id: number;
  name: string;
  category: string;
  image: string;
}

const KEY = "kelikuli-cart";

export function useCart() {
  const [items, setItems] = useState<CartProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (product: CartProduct) => {
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

  const clear = () => {
    setItems([]);
    localStorage.removeItem(KEY);
  };

  const isInCart = (id: number) => items.some((p) => p.id === id);

  return { items, toggle, remove, clear, isInCart, count: items.length };
}
