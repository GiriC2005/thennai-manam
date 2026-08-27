import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/types';

const STORAGE_KEY = 'pollachi_wishlist';

interface WishlistContextValue {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function toggleWishlist(product: Product) {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  }

  function isWishlisted(productId: string) {
    return items.some((p) => p.id === productId);
  }

  function removeFromWishlist(productId: string) {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, removeFromWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
