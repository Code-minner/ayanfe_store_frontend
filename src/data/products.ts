import type { ProductCardProps } from "@/components/ProductCard";

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
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

/** Default pack when adding from a card (cheapest in-stock variant, or base product). */
export function cartLineFromProduct(product: Product) {
  const pack =
    product.variants?.find((v) => v.stock > 0) ?? product.variants?.[0];
  return {
    productId: product.id,
    variantId: pack?.id,
    variantLabel: pack?.label,
    name: pack ? `${product.name} - ${pack.label}` : product.name,
    image: product.image,
    price: pack?.price ?? product.price,
    maxStock: pack?.stock ?? product.stock,
    href: product.href,
    color: product.colors?.[0],
  };
}

/** Pieces implied by labels like "100 pieces" / "5 piece". */
export function piecesFromPackLabel(label: string): number | null {
  const match = label.match(/(\d+)/);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
