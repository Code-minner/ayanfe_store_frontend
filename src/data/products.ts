import type { ProductCardProps } from "@/components/ProductCard";

export type Product = ProductCardProps & {
  id: string;
  slug: string;
  /** Matches CategoryInfo.slug */
  categorySlug: string;
  description?: string;
  images?: string[];
  colors?: string[];
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
