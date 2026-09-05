"use client";
import { useCallback, useEffect, useState } from "react";

export interface CartProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  moq?: number;
  quantity?: number;
}

function withDefaultQuantity(product: CartProduct): CartProduct {
  return { ...product, quantity: product.quantity ?? product.moq ?? 1 };
}

const ITEMS_KEY = "kelikuli-cart";
const EMAIL_KEY = "kelikuli-cart-email";
const SYNC_EVENT = "kelikuli-cart-sync";

function readItems(): CartProduct[] {
  try {
    return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function readEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}
function writeItems(items: CartProduct[]) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}
function notify() {
  window.dispatchEvent(new Event(SYNC_EVENT));
}

/**
 * Every useCart() call gets its own React state, so multiple components
 * (header badge, cart drawer, /cart page) stay in sync via this event +
 * localStorage rather than a shared context.
 */
export function useCart() {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  const sync = useCallback(() => {
    setItems(readItems());
    setEmail(readEmail());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const persist = (next: CartProduct[], acctEmail: string | null) => {
    writeItems(next);
    notify();
    if (acctEmail) {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acctEmail, items: next }),
      }).catch(() => {});
    }
  };

  const toggle = (product: CartProduct) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, withDefaultQuantity(product)];
      persist(next, email);
      return next;
    });
  };

  const remove = (id: number) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(next, email);
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    persist([], email);
  };

  const setQuantity = (id: number, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity) || 1);
    setItems((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, quantity: q } : p));
      persist(next, email);
      return next;
    });
  };

  const isInCart = (id: number) => items.some((p) => p.id === id);

  /**
   * Attach this browser to an email "account", merging in whatever's saved
   * server-side. Optionally adds one more product atomically in the same
   * write, so a gated "add to cart" doesn't race the email/items state.
   */
  const linkAccount = useCallback(async (rawEmail: string, pendingProduct?: CartProduct): Promise<CartProduct[]> => {
    const normalized = rawEmail.trim().toLowerCase();
    let serverItems: CartProduct[] = [];
    try {
      const res = await fetch(`/api/cart?email=${encodeURIComponent(normalized)}`);
      if (res.ok) serverItems = (await res.json()).items ?? [];
    } catch {}

    const local = readItems();
    const merged = [...serverItems];
    for (const it of local) if (!merged.some((m) => m.id === it.id)) merged.push(it);
    if (pendingProduct && !merged.some((m) => m.id === pendingProduct.id)) merged.push(withDefaultQuantity(pendingProduct));

    try {
      localStorage.setItem(EMAIL_KEY, normalized);
    } catch {}
    writeItems(merged);
    setEmail(normalized);
    setItems(merged);
    notify();

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, items: merged }),
    }).catch(() => {});

    return merged;
  }, []);

  /** Forget the linked email; the cart stays as a local/guest list. */
  const switchAccount = useCallback(() => {
    try {
      localStorage.removeItem(EMAIL_KEY);
    } catch {}
    setEmail(null);
    notify();
  }, []);

  return { items, toggle, remove, clear, setQuantity, isInCart, count: items.length, email, linkAccount, switchAccount };
}
