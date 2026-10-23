import type { Product } from "@/data/products";

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "discount";

export type PricePreset = "any" | "under-10k" | "10-25k" | "25-50k" | "50k-plus" | "custom";

export type ProductFilterState = {
  query: string;
  sort: SortOption;
  pricePreset: PricePreset;
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  inStock: boolean;
  colors: string[];
};

export const DEFAULT_FILTERS: ProductFilterState = {
  query: "",
  sort: "featured",
  pricePreset: "any",
  minPrice: "",
  maxPrice: "",
  onSale: false,
  inStock: false,
  colors: [],
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "discount", label: "Biggest discount" },
];

export const PRICE_PRESETS: { value: PricePreset; label: string; min?: number; max?: number }[] = [
  { value: "any", label: "Any price" },
  { value: "under-10k", label: "Under ₦10,000", max: 9999 },
  { value: "10-25k", label: "₦10,000 - ₦25,000", min: 10000, max: 25000 },
  { value: "25-50k", label: "₦25,000 - ₦50,000", min: 25000, max: 50000 },
  { value: "50k-plus", label: "₦50,000+", min: 50000 },
  { value: "custom", label: "Custom range" },
];

export function countActiveFilters(f: ProductFilterState): number {
  let n = 0;
  if (f.query.trim()) n += 1;
  if (f.sort !== "featured") n += 1;
  if (f.pricePreset !== "any") n += 1;
  if (f.onSale) n += 1;
  if (f.inStock) n += 1;
  if (f.colors.length) n += f.colors.length;
  return n;
}

export function hasActiveFilters(f: ProductFilterState): boolean {
  return countActiveFilters(f) > 0;
}

function resolvePriceBounds(f: ProductFilterState): { min?: number; max?: number } {
  if (f.pricePreset === "custom") {
    const min = f.minPrice.trim() ? Number(f.minPrice) : undefined;
    const max = f.maxPrice.trim() ? Number(f.maxPrice) : undefined;
    return {
      min: min !== undefined && Number.isFinite(min) ? min : undefined,
      max: max !== undefined && Number.isFinite(max) ? max : undefined,
    };
  }
  const preset = PRICE_PRESETS.find((p) => p.value === f.pricePreset);
  return { min: preset?.min, max: preset?.max };
}

export function collectColors(products: Product[]): string[] {
  const seen = new Set<string>();
  for (const p of products) {
    for (const c of p.colors ?? []) {
      const key = c.trim();
      if (key) seen.add(key);
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function filterAndSortProducts(products: Product[], f: ProductFilterState): Product[] {
  const { min, max } = resolvePriceBounds(f);
  const q = f.query.trim().toLowerCase();
  let list = products.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.subtitle ?? ""} ${p.category ?? ""} ${p.badge ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (min !== undefined && p.price < min) return false;
    if (max !== undefined && p.price > max) return false;
    if (f.onSale) {
      const onSale =
        !!p.originalPrice ||
        (p.discountPercent != null && p.discountPercent > 0) ||
        /sale/i.test(p.badge ?? "");
      if (!onSale) return false;
    }
    if (f.inStock && typeof p.stock === "number" && p.stock <= 0) return false;
    if (f.colors.length) {
      const pcs = (p.colors ?? []).map((c) => c.toLowerCase());
      if (!f.colors.some((c) => pcs.includes(c.toLowerCase()))) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "discount":
      list = [...list].sort(
        (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0) || a.price - b.price
      );
      break;
    default:
      break;
  }

  return list;
}
