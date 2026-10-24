"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CHECKOUT_FEE } from "@/data/payment";
import {
  shippingFeeFor,
  type ShippingMethodId,
} from "@/data/shipping";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  /** Max packs / units available for this line when added */
  maxStock?: number;
  color?: string;
  href?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  fee: number;
  shippingMethod: ShippingMethodId;
  shippingFee: number;
  total: number;
  setShippingMethod: (method: ShippingMethodId) => void;
  addItem: (
    item: Omit<CartItem, "quantity" | "id"> & { id?: string },
    quantity?: number
  ) => void;
  setQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ayanfe-cart";
const SHIPPING_KEY = "ayanfe-shipping-method";

function lineId(item: {
  productId: string;
  variantId?: string;
  color?: string;
}) {
  return [item.productId, item.variantId, item.color].filter(Boolean).join("-");
}

function normalizeStoredItem(raw: Partial<CartItem> & { id?: string }): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const productId =
    typeof raw.productId === "string" && raw.productId
      ? raw.productId
      : typeof raw.id === "string"
        ? raw.id.split("-")[0] || raw.id
        : "";
  if (!productId || typeof raw.name !== "string" || typeof raw.image !== "string") {
    return null;
  }
  const price = Number(raw.price);
  const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
  if (!Number.isFinite(price) || price < 0) return null;

  const variantId = typeof raw.variantId === "string" ? raw.variantId : undefined;
  const color = typeof raw.color === "string" ? raw.color : undefined;
  const maxStock =
    typeof raw.maxStock === "number" && Number.isFinite(raw.maxStock)
      ? Math.max(0, Math.floor(raw.maxStock))
      : undefined;

  return {
    id: raw.id || lineId({ productId, variantId, color }),
    productId,
    variantId,
    variantLabel: typeof raw.variantLabel === "string" ? raw.variantLabel : undefined,
    name: raw.name,
    image: raw.image,
    price,
    quantity: maxStock !== undefined ? Math.min(quantity, Math.max(1, maxStock)) : quantity,
    maxStock,
    color,
    href: typeof raw.href === "string" ? raw.href : undefined,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethodState] =
    useState<ShippingMethodId>("local_pickup");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown[];
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .map((row) => normalizeStoredItem(row as Partial<CartItem>))
              .filter((row): row is CartItem => Boolean(row))
          );
        }
      }
      const ship = localStorage.getItem(SHIPPING_KEY) as ShippingMethodId | null;
      if (ship === "local_pickup" || ship === "waybill" || ship === "stockpile") {
        setShippingMethodState(ship);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SHIPPING_KEY, shippingMethod);
  }, [shippingMethod, hydrated]);

  const setShippingMethod = (method: ShippingMethodId) => {
    setShippingMethodState(method);
  };

  const addItem = (
    item: Omit<CartItem, "quantity" | "id"> & { id?: string },
    quantity = 1
  ) => {
    const id = item.id || lineId(item);
    const cap = item.maxStock;
    const addQty = Math.max(1, Math.floor(quantity));

    setItems((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        const nextQty = existing.quantity + addQty;
        const limited =
          cap !== undefined ? Math.min(nextQty, Math.max(0, cap)) : nextQty;
        if (limited <= 0) return prev.filter((p) => p.id !== id);
        return prev.map((p) =>
          p.id === id
            ? {
                ...p,
                quantity: limited,
                maxStock: cap ?? p.maxStock,
                price: item.price,
                variantLabel: item.variantLabel ?? p.variantLabel,
              }
            : p
        );
      }
      const startQty = cap !== undefined ? Math.min(addQty, Math.max(0, cap)) : addQty;
      if (startQty <= 0) return prev;
      return [
        ...prev,
        {
          ...item,
          id,
          quantity: startQty,
        },
      ];
    });
  };

  const setQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) => {
          if (p.id !== id) return p;
          const next = Math.max(1, Math.floor(quantity));
          const limited =
            p.maxStock !== undefined ? Math.min(next, Math.max(1, p.maxStock)) : next;
          return { ...p, quantity: limited };
        })
        .filter((p) => p.quantity > 0)
    );
  };

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = p.quantity + 1;
        if (p.maxStock !== undefined && next > p.maxStock) return p;
        return { ...p, quantity: next };
      })
    );
  };

  const decrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const fee = items.length > 0 ? CHECKOUT_FEE : 0;
    const shippingFee = items.length > 0 ? shippingFeeFor(shippingMethod) : 0;
    return {
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      fee,
      shippingMethod,
      shippingFee,
      total: subtotal + fee + shippingFee,
      setShippingMethod,
      addItem,
      setQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
    };
  }, [items, shippingMethod]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
