import type { ProductCardProps } from "@/components/ProductCard";

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  /** Max units one customer may buy of this size/option per order. */
  maxPerOrder?: number;
  /** Colors for this size only. Empty/missing falls back to product.colors. */
  colors?: string[];
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

/**
 * Colors the shopper should pick for the current size (or product-level when
 * there are no sizes / legacy products).
 */
export function colorsForSelection(
  product: Product,
  selectedVariant?: ProductVariant | null
): string[] {
  const productColors = Array.isArray(product.colors)
    ? product.colors.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const variants = product.variants ?? [];
  const anySizeHasColors = variants.some(
    (v) => Array.isArray(v.colors) && v.colors.length > 0
  );

  if (selectedVariant) {
    const own = Array.isArray(selectedVariant.colors)
      ? selectedVariant.colors.map((c) => String(c).trim()).filter(Boolean)
      : [];
    if (own.length) return own;
    // This size has no colors on purpose when other sizes do.
    if (anySizeHasColors) return [];
    return productColors;
  }

  if (!variants.length) return productColors;
  // Wait for a size when colors are per-size.
  if (anySizeHasColors) return [];
  return productColors;
}

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

/**
 * True when the shopper must pick options before add.
 * Only products with admin-saved size/option variants. Legacy products
 * (subtitle text / colors only) buy with base stock, no forced picker.
 */
export function productRequiresOptions(product: Product): boolean {
  return Boolean(product.variants && product.variants.length > 0);
}

/** Product has nothing left to sell. Storefront hides these; admin still lists them. */
export function productIsOutOfStock(product: Product): boolean {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    return variants.every((v) => v.stock <= 0);
  }
  return (product.stock ?? 0) <= 0;
}

export function productPageHref(product: Product, pick = false): string {
  const base = product.href || `/product/${product.slug}`;
  if (!pick) return base;
  return `${base}${base.includes("?") ? "&" : "?"}pick=1`;
}

/** Size labels for cards (prefer in-stock; fall back to all so the list still shows). */
export function productSizeLabels(product: Product): string[] {
  const all = product.variants ?? [];
  const inStock = all.filter((v) => v.stock > 0).map((v) => v.label);
  if (inStock.length) return inStock;
  return all.map((v) => v.label);
}

/** Only for products with no size/color options. */
export function cartLineFromProduct(product: Product) {
  if (productRequiresOptions(product)) {
    throw new Error("This product needs a size or color. Open the product page to choose.");
  }
  const stock = product.stock ?? 0;
  return {
    productId: product.id,
    brand: product.brand,
    name: product.name,
    image: product.image,
    price: product.price,
    maxStock: purchaseCap(stock),
    href: product.href,
    bonusQty: product.bonusQty,
    bonusPercent: product.bonusPercent,
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
