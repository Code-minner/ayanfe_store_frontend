"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import ProductGrid from "@/components/ProductGrid";
import CategoryToolbar from "@/components/CategoryToolbar";
import CategoryFilters from "@/components/CategoryFilters";
import type { Product } from "@/data/products";
import { apiFetchProductsPage } from "@/lib/api";
import {
  DEFAULT_FILTERS,
  collectColors,
  countActiveFilters,
  filterAndSortProducts,
  hasActiveFilters,
  type ProductFilterState,
} from "@/lib/productFilters";

const PAGE_SIZE = 24;
const FILTER_FETCH_LIMIT = 100;

export default function CategoryProductList({
  categorySlug,
  categoryName,
  initialProducts,
  initialTotal,
  initialTotalPages,
}: {
  categorySlug: string;
  categoryName: string;
  initialProducts: Product[];
  initialTotal: number;
  initialTotalPages: number;
}) {
  const [page, setPage] = useState(1);
  const [pageProducts, setPageProducts] = useState(initialProducts);
  const [catalog, setCatalog] = useState(initialProducts);
  const [serverTotal, setServerTotal] = useState(initialTotal);
  const [serverTotalPages, setServerTotalPages] = useState(initialTotalPages);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [filterOpen, setFilterOpen] = useState(true);
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);

  const filtering = hasActiveFilters(filters);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetchProductsPage({
          category: categorySlug,
          page: 1,
          limit: FILTER_FETCH_LIMIT,
        });
        if (cancelled) return;
        setCatalog(data.products);
      } catch {
        /* keep SSR catalog */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const colors = useMemo(() => collectColors(catalog), [catalog]);

  const filtered = useMemo(
    () => filterAndSortProducts(catalog, filters),
    [catalog, filters]
  );

  const displayProducts = useMemo(() => {
    if (!filtering) return pageProducts;
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtering, pageProducts, filtered, page]);

  const total = filtering ? filtered.length : serverTotal;
  const totalPages = filtering
    ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    : serverTotalPages;

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const activeCount = countActiveFilters(filters);

  const resultLabel =
    total === 0
      ? "No products match"
      : filtering
        ? `${total} ${total === 1 ? "product" : "products"} match your filters`
        : `${total} ${total === 1 ? "product" : "products"}`;

  const updateFilters = (next: ProductFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const removeChip = (key: string) => {
    const next = { ...filters };
    if (key === "query") next.query = "";
    else if (key === "sort") next.sort = "featured";
    else if (key === "price") {
      next.pricePreset = "any";
      next.minPrice = "";
      next.maxPrice = "";
    } else if (key === "sale") next.onSale = false;
    else if (key === "stock") next.inStock = false;
    else if (key.startsWith("color:")) {
      const c = key.slice(6);
      next.colors = next.colors.filter((x) => x !== c);
    }
    updateFilters(next);
  };

  const goTo = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    if (target === page) return;

    if (filtering) {
      setPage(target);
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    startTransition(async () => {
      try {
        setError("");
        const data = await apiFetchProductsPage({
          category: categorySlug,
          page: target,
          limit: PAGE_SIZE,
        });
        setPageProducts(data.products);
        setServerTotal(data.total);
        setServerTotalPages(data.totalPages);
        setPage(data.page);
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load products");
      }
    });
  };

  const chips: { key: string; label: string }[] = [];
  if (filters.query.trim()) {
    chips.push({ key: "query", label: `"${filters.query.trim()}"` });
  }
  if (filters.sort !== "featured") {
    chips.push({
      key: "sort",
      label:
        filters.sort === "price-asc"
          ? "Price ↑"
          : filters.sort === "price-desc"
            ? "Price ↓"
            : filters.sort === "name-asc"
              ? "Name A-Z"
              : "Biggest discount",
    });
  }
  if (filters.pricePreset !== "any") {
    chips.push({
      key: "price",
      label:
        filters.pricePreset === "custom"
          ? `₦${filters.minPrice || "0"} - ₦${filters.maxPrice || "any"}`
          : filters.pricePreset === "under-10k"
            ? "Under ₦10k"
            : filters.pricePreset === "10-25k"
              ? "₦10-25k"
              : filters.pricePreset === "25-50k"
                ? "₦25-50k"
                : "₦50k+",
    });
  }
  if (filters.onSale) chips.push({ key: "sale", label: "On sale" });
  if (filters.inStock) chips.push({ key: "stock", label: "In stock" });
  for (const c of filters.colors) chips.push({ key: `color:${c}`, label: c });

  return (
    <div>
      <CategoryToolbar
        name={categoryName}
        filterOpen={filterOpen}
        activeFilterCount={activeCount}
        onFilterToggle={() => setFilterOpen((o) => !o)}
        resultLabel={resultLabel}
      />

      {chips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7FB] px-3 py-1.5 text-xs font-medium text-[#6B0080] transition-colors hover:bg-[#f0e8f5]"
              >
                {chip.label}
                <span aria-hidden className="text-sm leading-none opacity-70">
                  ×
                </span>
                <span className="sr-only">Remove {chip.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      <div
        className={`mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:items-start lg:gap-8 ${
          pending ? "opacity-70 transition-opacity" : ""
        }`}
      >
        <CategoryFilters
          open={filterOpen}
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          colors={colors}
          resultCount={filtering ? filtered.length : serverTotal}
        />

        <div className="min-w-0 flex-1">
          {!displayProducts.length && !pending ? (
            <p className="py-12 text-center text-sm text-neutral-600">
              {filtering
                ? "No products match these filters. Try clearing a few."
                : "No products in this category yet."}
            </p>
          ) : (
            <ProductGrid
              products={displayProducts}
              hideCategory
              besideFilters={filterOpen}
            />
          )}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {totalPages > 1 && displayProducts.length > 0 ? (
            <nav
              className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-6"
              aria-label="Category products pages"
            >
              <p className="text-xs text-neutral-500">
                Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of{" "}
                {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goTo(page - 1)}
                  disabled={page <= 1 || pending}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Prev
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goTo(n)}
                    disabled={pending}
                    aria-current={n === page ? "page" : undefined}
                    className={`min-w-9 rounded-full px-2.5 py-1.5 text-sm font-medium ${
                      n === page
                        ? "bg-[#6B0080] text-white"
                        : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goTo(page + 1)}
                  disabled={page >= totalPages || pending}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
