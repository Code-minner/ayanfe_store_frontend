"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  apiAddWishlist,
  apiGetWishlist,
  apiRemoveWishlist,
  mapApiProduct,
  type ApiProduct,
} from "@/lib/api";

interface WishlistContextValue {
  items: Product[];
  ids: Set<string>;
  slugs: Set<string>;
  loading: boolean;
  count: number;
  toggle: (product: Product) => Promise<void>;
  remove: (idOrSlug: string) => Promise<void>;
  has: (idOrSlug: string) => boolean;
  clear: () => void;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function toProduct(p: ApiProduct): Product {
  return mapApiProduct(p, { thumb: true });
}

function productKey(product: Pick<Product, "id" | "slug">) {
  return (product.slug || product.id).replace(/^new-/, "");
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token, isSignedIn, hydrated: authHydrated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const pending = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    if (!token || !isSignedIn) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGetWishlist(token);
      setItems(data.items.map(toProduct));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, isSignedIn]);

  useEffect(() => {
    if (!authHydrated) return;
    void refresh();
  }, [authHydrated, refresh]);

  const value = useMemo<WishlistContextValue>(() => {
    const ids = new Set(items.map((i) => i.id));
    const slugs = new Set(items.map((i) => i.slug));
    return {
      items,
      ids,
      slugs,
      loading,
      count: items.length,
      has: (idOrSlug) => {
        const key = idOrSlug.replace(/^new-/, "");
        return ids.has(idOrSlug) || slugs.has(idOrSlug) || ids.has(key) || slugs.has(key);
      },
      refresh,
      clear: () => setItems([]),
      toggle: async (product) => {
        if (!token || !isSignedIn) {
          const next =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/wishlist";
          window.location.href = `/login?next=${encodeURIComponent(next)}`;
          return;
        }

        const key = productKey(product);
        if (pending.current.has(key)) return;
        pending.current.add(key);

        const exists =
          ids.has(product.id) ||
          slugs.has(product.slug) ||
          ids.has(key) ||
          slugs.has(key);

        const snapshot = items;

        if (exists) {
          setItems((prev) =>
            prev.filter(
              (p) =>
                p.id !== product.id &&
                p.slug !== product.slug &&
                p.id !== key &&
                p.slug !== key
            )
          );
          toast("Removed from wishlist");
        } else {
          const optimistic: Product = {
            ...product,
            id: product.id,
            slug: key,
            href: product.href || `/product/${key}`,
          };
          setItems((prev) => {
            if (prev.some((p) => p.slug === key || p.id === product.id)) return prev;
            return [optimistic, ...prev];
          });
          toast("Saved to wishlist", "success");
        }

        try {
          if (exists) {
            await apiRemoveWishlist(token, key);
          } else {
            const { product: saved } = await apiAddWishlist(token, key);
            const next = toProduct(saved);
            setItems((prev) => {
              const without = prev.filter((p) => p.slug !== key && p.id !== product.id);
              if (without.some((p) => p.id === next.id)) return without;
              return [next, ...without];
            });
          }
        } catch (err) {
          setItems(snapshot);
          toast(err instanceof Error ? err.message : "Could not update wishlist", "error");
        } finally {
          pending.current.delete(key);
        }
      },
      remove: async (idOrSlug) => {
        if (!token || !isSignedIn) return;
        const key = idOrSlug.replace(/^new-/, "");
        if (pending.current.has(key)) return;
        pending.current.add(key);
        const snapshot = items;
        setItems((prev) =>
          prev.filter((p) => p.id !== key && p.slug !== key && p.id !== idOrSlug && p.slug !== idOrSlug)
        );
        toast("Removed from wishlist");
        try {
          await apiRemoveWishlist(token, key);
        } catch (err) {
          setItems(snapshot);
          toast(err instanceof Error ? err.message : "Could not update wishlist", "error");
        } finally {
          pending.current.delete(key);
        }
      },
    };
  }, [items, loading, token, isSignedIn, refresh, toast]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
