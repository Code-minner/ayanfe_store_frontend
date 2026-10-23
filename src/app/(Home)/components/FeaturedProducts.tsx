"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/data/products";
import { apiFetchProductsPage } from "@/lib/api";

interface FeaturedProductsProps {
  products?: Product[];
  initialTotal?: number;
  initialTotalPages?: number;
  viewAllHref?: string;
  onAdd?: (product: Product, quantity: number) => void;
  /** Desktop: 4 columns x 4 rows = 16 */
  pageSize?: number;
}

function pageWindow(page: number, totalPages: number, maxButtons = 5) {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Pagination({
  page,
  totalPages,
  onChange,
  pending,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  pending?: boolean;
}) {
  if (totalPages <= 1) return null;

  const numbers = pageWindow(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:mt-12 sm:gap-2"
      aria-label="Featured products pages"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1 || pending}
        aria-label="Previous page"
        className="mr-1 grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>

      {numbers[0] > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            disabled={pending}
            className="grid h-10 min-w-10 place-items-center rounded-full bg-white px-3 text-sm font-medium text-neutral-500 ring-1 ring-neutral-200 hover:text-neutral-900"
          >
            1
          </button>
          {numbers[0] > 2 ? (
            <span className="px-1 text-neutral-400" aria-hidden>
              …
            </span>
          ) : null}
        </>
      ) : null}

      {numbers.map((n) => {
        const active = n === page;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            disabled={pending}
            aria-label={`Page ${n}`}
            aria-current={active ? "page" : undefined}
            className={[
              "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080]",
              active
                ? "bg-[#6B0080] font-semibold text-white shadow-[0_8px_20px_rgba(107,0,128,0.28)]"
                : "bg-white font-medium text-neutral-500 ring-1 ring-neutral-200 hover:text-neutral-900 hover:ring-neutral-300",
            ].join(" ")}
          >
            {n}
          </button>
        );
      })}

      {numbers[numbers.length - 1] < totalPages ? (
        <>
          {numbers[numbers.length - 1] < totalPages - 1 ? (
            <span className="px-1 text-neutral-400" aria-hidden>
              …
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onChange(totalPages)}
            disabled={pending}
            className="grid h-10 min-w-10 place-items-center rounded-full bg-white px-3 text-sm font-medium text-neutral-500 ring-1 ring-neutral-200 hover:text-neutral-900"
          >
            {totalPages}
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages || pending}
        aria-label="Next page"
        className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </nav>
  );
}

export default function FeaturedProducts({
  products: initialProducts = [],
  initialTotal,
  initialTotalPages,
  viewAllHref = "/shop",
  onAdd,
  pageSize = 16,
}: FeaturedProductsProps) {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal ?? initialProducts.length);
  const [totalPages, setTotalPages] = useState(
    initialTotalPages ?? Math.max(1, Math.ceil((initialTotal ?? initialProducts.length) / pageSize))
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const goTo = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    if (target === page) return;

    startTransition(async () => {
      try {
        setError("");
        const data = await apiFetchProductsPage({
          page: target,
          limit: pageSize,
        });
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
        document
          .getElementById("featured-title")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load products");
      }
    });
  };

  const resultLabel = useMemo(() => {
    if (!total) return "No products yet";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `Showing ${start}-${end} of ${total}`;
  }, [page, pageSize, total]);

  return (
    <section className="section-y bg-white" aria-labelledby="featured-title">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 id="featured-title" className="section-heading scroll-mt-28 text-[#6B0080]">
              Featured products
            </h2>
            <p className="mt-3 text-sm text-neutral-900">
              Check out our top picks trending items handpicked just for you
            </p>
            <p className="mt-1 text-xs text-neutral-500">{resultLabel}</p>
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex w-fit shrink-0 items-center rounded-full border border-[#6B0080] px-6 py-2.5 text-sm font-medium text-[#6B0080] transition-colors hover:bg-[#6B0080] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080] sm:px-8"
          >
            View all
          </Link>
        </div>

        <div className={`mt-6 sm:mt-8 ${pending ? "opacity-70 transition-opacity" : ""}`}>
          <ProductGrid products={products} onAdd={onAdd} />
        </div>
        {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}

        <Pagination page={page} totalPages={totalPages} onChange={goTo} pending={pending} />
      </div>
    </section>
  );
}
