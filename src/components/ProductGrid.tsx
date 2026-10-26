"use client";

import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useProductQuickAdd } from "@/hooks/useProductQuickAdd";
import {
  productIsOutOfStock,
  productRequiresOptions,
  productSizeLabels,
  type Product,
} from "@/data/products";

interface ProductGridProps {
  products: Product[];
  onAdd?: (product: Product, quantity: number) => void;
  emptyMessage?: string;
  /** Hide category labels (useful on category pages where the page title already says it). */
  hideCategory?: boolean;
  /** Tighter grid when a filter sidebar is beside the products. */
  besideFilters?: boolean;
}

export default function ProductGrid({
  products,
  onAdd,
  emptyMessage = "No products in this category yet.",
  hideCategory = false,
  besideFilters = false,
}: ProductGridProps) {
  const { has, toggle } = useWishlist();
  const { addFromCard, modal } = useProductQuickAdd();

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-neutral-500">{emptyMessage}</p>
    );
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12 ${
          besideFilters ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {products.map((product, index) => {
          const sizes = productSizeLabels(product);
          const requiresOptions = productRequiresOptions(product);
          const outOfStock = productIsOutOfStock(product);
          const optionsHint = sizes.length
            ? `Sizes: ${sizes.slice(0, 8).join(", ")}${sizes.length > 8 ? "…" : ""}`
            : undefined;

          return (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
            >
              <ProductCard
                name={product.name}
                image={product.image}
                price={product.priceMin ?? product.price}
                priceMax={product.priceMax}
                href={product.href}
                badge={product.badge}
                category={hideCategory ? undefined : product.category}
                brand={product.brand}
                colors={product.colors}
                subtitle={product.subtitle}
                optionsHint={optionsHint}
                requiresOptions={requiresOptions}
                outOfStock={outOfStock}
                originalPrice={product.originalPrice}
                discountPercent={product.discountPercent}
                priority={index < 4}
                isWishlisted={has(product.id) || has(product.slug)}
                onWishlistToggle={() => {
                  void toggle(product);
                }}
                onAdd={(quantity) => {
                  if (onAdd) {
                    onAdd(product, quantity);
                    return;
                  }
                  addFromCard(product, quantity);
                }}
              />
            </div>
          );
        })}
      </div>
      {modal}
    </>
  );
}
