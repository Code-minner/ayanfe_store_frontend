"use client";

import { useState } from "react";
import {
  DEFAULT_FILTERS,
  PRICE_PRESETS,
  SORT_OPTIONS,
  type ProductFilterState,
  type SortOption,
  type PricePreset,
} from "@/lib/productFilters";

type CategoryFiltersProps = {
  open: boolean;
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  onClear: () => void;
  colors: string[];
  resultCount: number;
};

function colorSwatch(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, string> = {
    black: "#1a1a1a",
    white: "#f5f5f5",
    red: "#dc2626",
    blue: "#2563eb",
    navy: "#1e3a5f",
    green: "#16a34a",
    pink: "#ec4899",
    purple: "#6B0080",
    brown: "#92400e",
    beige: "#d6c6a8",
    grey: "#9ca3af",
    gray: "#9ca3af",
    gold: "#d4a017",
    silver: "#c0c0c0",
    yellow: "#eab308",
    orange: "#ea580c",
    cream: "#f5f0e6",
    nude: "#e8c4a8",
    multicolor: "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
    multi: "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
  };
  return map[key] ?? "#c4b5d0";
}

export default function CategoryFilters({
  open,
  filters,
  onChange,
  onClear,
  colors,
  resultCount,
}: CategoryFiltersProps) {
  const [showAllColors, setShowAllColors] = useState(false);

  if (!open) return null;

  const set = (patch: Partial<ProductFilterState>) => onChange({ ...filters, ...patch });

  const toggleColor = (c: string) => {
    const next = filters.colors.includes(c)
      ? filters.colors.filter((x) => x !== c)
      : [...filters.colors, c];
    set({ colors: next });
  };

  const COLOR_PREVIEW = 8;
  const visibleColors = showAllColors ? colors : colors.slice(0, COLOR_PREVIEW);

  return (
    <aside
      aria-label="Product filters"
      className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[240px] lg:self-start xl:w-[260px]"
    >
      <div className="rounded-2xl border border-neutral-200 bg-[#FAFAFA] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-anton)] text-xl uppercase tracking-wide text-neutral-900">
            Filters
          </h2>
          <button
            type="button"
            onClick={() => {
              onChange({ ...DEFAULT_FILTERS });
              onClear();
            }}
            className="text-xs font-medium text-[#6B0080] underline-offset-2 hover:underline"
          >
            Clear
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {resultCount} {resultCount === 1 ? "item" : "items"}
        </p>

        <section className="mt-5" aria-labelledby="filter-search">
          <h3
            id="filter-search"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
          >
            Search
          </h3>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search here"
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-[#6B0080]"
          />
        </section>

        <section className="mt-5" aria-labelledby="filter-sort">
          <h3
            id="filter-sort"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
          >
            Sort by
          </h3>
          <ul className="mt-2 space-y-1">
            {SORT_OPTIONS.map((opt) => {
              const active = filters.sort === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => set({ sort: opt.value as SortOption })}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                      active
                        ? "bg-[#6B0080] text-white"
                        : "text-neutral-800 hover:bg-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active ? <span aria-hidden>✓</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-5" aria-labelledby="filter-price">
          <h3
            id="filter-price"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
          >
            Price
          </h3>
          <ul className="mt-2 space-y-1">
            {PRICE_PRESETS.filter((p) => p.value !== "custom").map((p) => {
              const active = filters.pricePreset === p.value;
              return (
                <li key={p.value}>
                  <button
                    type="button"
                    onClick={() =>
                      set({
                        pricePreset: p.value as PricePreset,
                        minPrice: "",
                        maxPrice: "",
                      })
                    }
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                      active
                        ? "bg-[#6B0080] text-white"
                        : "text-neutral-800 hover:bg-white"
                    }`}
                  >
                    {p.label}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => set({ pricePreset: "custom" })}
                className={`w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                  filters.pricePreset === "custom"
                    ? "bg-[#6B0080] text-white"
                    : "text-neutral-800 hover:bg-white"
                }`}
              >
                Custom range
              </button>
            </li>
          </ul>

          {filters.pricePreset === "custom" ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] text-neutral-500">Min</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => set({ minPrice: e.target.value })}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#6B0080]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-neutral-500">Max</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => set({ maxPrice: e.target.value })}
                  placeholder="Any"
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#6B0080]"
                />
              </label>
            </div>
          ) : null}
        </section>

        <section className="mt-5" aria-labelledby="filter-offers">
          <h3
            id="filter-offers"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
          >
            Offers
          </h3>
          <div className="mt-2 space-y-1.5">
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white">
              <span className="text-[13px] text-neutral-800">On sale</span>
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => set({ onSale: e.target.checked })}
                className="h-4 w-4 accent-[#6B0080]"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white">
              <span className="text-[13px] text-neutral-800">In stock</span>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => set({ inStock: e.target.checked })}
                className="h-4 w-4 accent-[#6B0080]"
              />
            </label>
          </div>
        </section>

        {colors.length > 0 ? (
          <section className="mt-5" aria-labelledby="filter-color">
            <h3
              id="filter-color"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500"
            >
              Colour
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {visibleColors.map((c) => {
                const active = filters.colors.includes(c);
                const bg = colorSwatch(c);
                const isLight = /white|cream|beige|silver|yellow|gold|nude/i.test(c);
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => toggleColor(c)}
                      aria-pressed={active}
                      title={c}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active
                          ? "border-[#6B0080] bg-white text-[#6B0080] ring-1 ring-[#6B0080]/30"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          isLight ? "ring-1 ring-neutral-300" : ""
                        }`}
                        style={{ background: bg }}
                      />
                      {c}
                    </button>
                  </li>
                );
              })}
            </ul>
            {colors.length > COLOR_PREVIEW ? (
              <button
                type="button"
                onClick={() => setShowAllColors((v) => !v)}
                className="mt-2 text-xs font-medium text-[#6B0080] underline-offset-2 hover:underline"
              >
                {showAllColors ? "Show less" : `Show all colours (${colors.length})`}
              </button>
            ) : null}
          </section>
        ) : null}
      </div>
    </aside>
  );
}
