"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { useCart, type CartProduct } from "@/hooks/useCart";
import CartEmailGate from "@/components/CartEmailGate";
import CartDrawer from "@/components/CartDrawer";

interface CartGateContextValue {
  /** Add (or remove, if already present) a product. Gates on email first if no account is linked yet. */
  addToCart: (product: CartProduct) => void;
  /** Open the quick-shopping drawer, gating on email first if needed. */
  openCart: () => void;
  isInCart: (id: number) => boolean;
  count: number;
}

const CartGateContext = createContext<CartGateContextValue | null>(null);

export function useCartGate() {
  const ctx = useContext(CartGateContext);
  if (!ctx) throw new Error("useCartGate must be used within CartGateProvider");
  return ctx;
}

/**
 * Every cart mutation is tied to an email "account" (see hooks/useCart), so
 * adding a product — not just opening the drawer — must gate on email first.
 * This provider owns that single gate + drawer instance for the whole app.
 */
export default function CartGateProvider({ children }: { children: React.ReactNode }) {
  const { toggle, isInCart, count, email, linkAccount } = useCart();
  const [gateOpen, setGateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState<CartProduct | null>(null);

  const addToCart = useCallback(
    (product: CartProduct) => {
      if (email) {
        toggle(product);
        return;
      }
      setPending(product);
      setGateOpen(true);
    },
    [email, toggle],
  );

  const openCart = useCallback(() => {
    if (email) setDrawerOpen(true);
    else setGateOpen(true);
  }, [email]);

  const handleGateSubmit = useCallback(
    async (submittedEmail: string) => {
      await linkAccount(submittedEmail, pending ?? undefined);
      setPending(null);
      setGateOpen(false);
      setDrawerOpen(true);
    },
    [linkAccount, pending],
  );

  const handleGateClose = useCallback(() => {
    setGateOpen(false);
    setPending(null);
  }, []);

  return (
    <CartGateContext.Provider value={{ addToCart, openCart, isInCart, count }}>
      {children}
      <CartEmailGate isOpen={gateOpen} onClose={handleGateClose} onSubmit={handleGateSubmit} />
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </CartGateContext.Provider>
  );
}
