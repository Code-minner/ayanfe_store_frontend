import type { ProductCardProps } from "@/components/ProductCard";

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  /** Max units one customer may buy of this size/option per order. */
  maxPerOrder?: number;
};

export type Product = ProductCardProps & {
  id: string;
  slug: string;
  /** Matches CategoryInfo.slug */
  categorySlug: string;
  description?: string;
  images?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  priceMin?: number;
  priceMax?: number;
  stock?: number;
  sku?: string;
};

export const getRelatedProducts = <T extends { id: string; categorySlug: string }>(
  products: T[],
  product: T,
  limit = 4
) =>
  products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);

function purchaseCap(stock: number, maxPerOrder?: number) {
  if (maxPerOrder && maxPerOrder > 0) return Math.min(stock, maxPerOrder);
  return stock;
}

/** Default option when adding from a card (first in-stock size, or base product). */
export function cartLineFromProduct(product: Product) {
  const pack =
    product.variants?.find((v) => v.stock > 0) ?? product.variants?.[0];
  const stock = pack?.stock ?? product.stock ?? 0;
  return {
    productId: product.id,
    variantId: pack?.id,
    variantLabel: pack?.label,
    size: pack?.label,
    brand: product.brand,
    name: product.name,
    image: product.image,
    price: pack?.price ?? product.price,
    maxStock: purchaseCap(stock, pack?.maxPerOrder),
    href: product.href,
    color: product.colors?.[0],
  };
}

export function isColorHex(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/** Pieces implied by labels like "100 pieces" / "5 piece". */
export function piecesFromPackLabel(label: string): number | null {
  const match = label.match(/(\d+)/);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
