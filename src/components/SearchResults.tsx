"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SearchIcon } from "../../public/svg/svg";
import { apiFetchProductsPage } from "@/lib/api";
import type { Product } from "@/data/products";

const PAGE_SIZE = 24;

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = (searchParams.get("q") ?? "").trim();

  const [input, setInput] = useState(qParam);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(qParam);
    setPage(1);
  }, [qParam]);

  useEffect(() => {
    if (!qParam) {
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
      setSearched(false);
      setError("");
      return;
    }

    let cancelled = false;
    startTransition(async () => {
      try {
        setError("");
        const data = await apiFetchProductsPage({
          q: qParam,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSearched(true);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not search products");
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
        setSearched(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [qParam, page]);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = input.trim();
    if (!next) return;
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  const goTo = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    if (target === page) return;
    setPage(target);
    document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: qParam ? `Search: ${qParam}` : "Search" },
        ]}
      />

      <div className="mt-6 max-w-2xl">
        <h1 className="font-[family-name:var(--font-anton)] text-3xl uppercase tracking-wide text-[#6B0080] sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Find products by name across the whole store.
        </p>

        <form
          role="search"
          onSubmit={handleSubmit}
          className="mt-5 flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 focus-within:border-[#6B0080]"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-neutral-600" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#6B0080] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#5a006c]"
          >
            Search
          </button>
        </form>
      </div>

      <section id="search-results" className="mt-10 scroll-mt-28">
        {!qParam ? (
          <p className="text-sm text-neutral-500">
            Type a product name above, or try{" "}
            <Link href="/shop" className="font-medium text-[#6B0080] underline-offset-2 hover:underline">
              browsing all categories
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="text-sm text-neutral-600">
              {pending && !searched
                ? "Searching…"
                : total === 0
                  ? `No results for "${qParam}"`
                  : `${total} ${total === 1 ? "result" : "results"} for "${qParam}"`}
            </p>

            <div className={`mt-6 ${pending ? "opacity-70 transition-opacity" : ""}`}>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {!error && searched && products.length === 0 && !pending ? (
                <div className="rounded-2xl border border-neutral-200 px-6 py-16 text-center">
                  <p className="text-sm text-neutral-600">
                    Nothing matched that search. Try a shorter word or browse categories.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex rounded-full bg-[#6B0080] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5a006c]"
                  >
                    Shop all
                  </Link>
                </div>
              ) : products.length > 0 ? (
                <ProductGrid products={products} />
              ) : null}
            </div>

            {totalPages > 1 && products.length > 0 ? (
              <nav
                className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-6"
                aria-label="Search results pages"
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
          </>
        )}
      </section>
    </div>
  );
}
