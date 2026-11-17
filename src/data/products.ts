import type { ProductCardProps } from "@/components/ProductCard";

export type ProductVariantColor = {
  color: string;
  stock: number;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  /** Max units one customer may buy of this size/option per order. */
  maxPerOrder?: number;
  /** Colors for this size with per-color stock. Legacy strings are normalized upstream. */
  colors?: ProductVariantColor[];
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

function normalizeVariantColors(
  colors?: Array<string | ProductVariantColor> | null
): ProductVariantColor[] {
  if (!Array.isArray(colors)) return [];
  const out: ProductVariantColor[] = [];
  const seen = new Set<string>();
  for (const raw of colors) {
    if (typeof raw === "string") {
      const color = raw.trim();
      if (!color) continue;
      const key = color.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ color, stock: 0 });
      continue;
    }
    if (!raw || typeof raw !== "object") continue;
    const color = String(raw.color || "").trim();
    if (!color) continue;
    const key = color.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      color,
      stock: Math.max(0, Math.floor(Number(raw.stock) || 0)),
    });
  }
  return out;
}

/** True when a label is a real size (42, M, Age 5), not a placeholder like "1". */
export function variantLooksLikeSize(label: string) {
  const t = label.trim();
  return (
    /^\d{2,3}$/.test(t) ||
    /^age\s*\d+/i.test(t) ||
    /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(t)
  );
}

export function productHasRealSizes(product: Product) {
  return (product.variants ?? []).some((v) => variantLooksLikeSize(v.label));
}

export type FlatColorChoice = ProductVariantColor & {
  variantId?: string;
  price?: number;
  maxPerOrder?: number;
};

/**
 * Flatten all variant colors into one list (for bags / products whose
 * "options" are really color SKUs labeled "1").
 */
export function flattenedColorsForProduct(product: Product): FlatColorChoice[] {
  const variants = product.variants ?? [];
  const out: FlatColorChoice[] = [];
  const seen = new Set<string>();
  for (const v of variants) {
    const colors = normalizeVariantColors(v.colors);
    if (!colors.length) continue;
    for (const c of colors) {
      const key = c.color.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const stock =
        colors.every((x) => x.stock <= 0) && v.stock > 0 ? v.stock : c.stock;
      out.push({
        color: c.color,
        stock,
        variantId: v.id,
        price: v.price,
        maxPerOrder: v.maxPerOrder,
      });
    }
  }
  return out;
}

/**
 * Colors the shopper should pick for the current size (or product-level when
 * there are no sizes / legacy products), including per-color stock.
 */
export function colorsForSelection(
  product: Product,
  selectedVariant?: ProductVariant | null
): ProductVariantColor[] {
  const productColors = Array.isArray(product.colors)
    ? product.colors
        .map((c) => String(c).trim())
        .filter(Boolean)
        .map((color) => ({ color, stock: product.stock ?? 0 }))
    : [];
  const variants = product.variants ?? [];
  const anySizeHasColors = variants.some(
    (v) => Array.isArray(v.colors) && v.colors.length > 0
  );

  if (selectedVariant) {
    const own = normalizeVariantColors(selectedVariant.colors);
    if (own.length) {
      // Legacy all-zero color stocks: share the size stock.
      if (own.every((c) => c.stock <= 0) && selectedVariant.stock > 0) {
        return own.map((c) => ({ ...c, stock: selectedVariant.stock }));
      }
      return own;
    }
    if (anySizeHasColors) return [];
    return productColors.map((c) => ({ ...c, stock: selectedVariant.stock }));
  }

  if (!variants.length) return productColors;
  if (anySizeHasColors) return [];
  return productColors;
}

/** Stock available for a specific color on a size (or shared size stock). */
export function stockForColorChoice(
  selectedVariant: ProductVariant | null | undefined,
  color: string | undefined,
  fallbackStock = 0
) {
  if (!selectedVariant) return fallbackStock;
  const colors = normalizeVariantColors(selectedVariant.colors);
  if (!colors.length) return selectedVariant.stock;
  if (!color) return 0;
  const hit = colors.find(
    (c) => c.color.trim().toLowerCase() === color.trim().toLowerCase()
  );
  if (!hit) return 0;
  // Legacy: all color stocks 0 means shared size stock.
  if (colors.every((c) => c.stock <= 0) && selectedVariant.stock > 0) {
    return selectedVariant.stock;
  }
  return hit.stock;
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

const KNOWN_COLOR_NAMES: Record<string, string> = {
  "#111111": "Black",
  "#000000": "Black",
  "#ffffff": "White",
  "#c9a227": "Gold",
  "#c0c0c0": "Silver",
  "#f9a8d4": "Pink",
  "#8b5e3c": "Brown",
  "#dc2626": "Red",
  "#2563eb": "Blue",
};

/** Readable label beside a swatch (maps known hex codes to names). */
export function colorDisplayName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Color";
  if (!isColorHex(trimmed)) return trimmed;
  return KNOWN_COLOR_NAMES[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

/** CSS background for a stored color value (hex or named). */
export function colorSwatchBackground(value: string) {
  const trimmed = value.trim();
  if (isColorHex(trimmed)) return trimmed;
  const hit = Object.entries(KNOWN_COLOR_NAMES).find(
    ([, name]) => name.toLowerCase() === trimmed.toLowerCase()
  );
  return hit?.[0] ?? "#e5e5e5";
}

/** Pieces implied by labels like "100 pieces" / "5 piece". */
export function piecesFromPackLabel(label: string): number | null {
  const match = label.match(/(\d+)/);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
