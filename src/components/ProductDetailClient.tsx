"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { isColorHex, piecesFromPackLabel } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";

const BULK_QTY_PRESETS = [1, 5, 10, 20, 50, 100];

function purchaseCap(stock: number, maxPerOrder?: number) {
  if (maxPerOrder && maxPerOrder > 0) return Math.min(stock, maxPerOrder);
  return stock;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const optionsRef = useRef<HTMLDivElement>(null);
  const gallery = product.images?.length ? product.images : [product.image];
  const variants = product.variants ?? [];
  const hasOptions = variants.length > 0;
  const hasColors = Boolean(product.colors && product.colors.length > 0);
  const forcePick = searchParams.get("pick") === "1";

  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitMsg, setLimitMsg] = useState("");

  useEffect(() => {
    if (!forcePick) return;
    setLimitMsg(
      hasOptions && hasColors
        ? "Please select a size and color before adding to cart."
        : hasOptions
          ? "Please select a size before adding to cart."
          : hasColors
            ? "Please select a color before adding to cart."
            : ""
    );
    optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [forcePick, hasOptions, hasColors]);

  const selectedVariant = useMemo(
    () => (variantId ? variants.find((v) => v.id === variantId) : undefined),
    [variants, variantId]
  );

  const unitPrice = hasOptions ? selectedVariant?.price ?? product.price : product.price;
  const rawStock = hasOptions ? selectedVariant?.stock ?? 0 : product.stock ?? 0;
  const maxAllowed = hasOptions
    ? selectedVariant
      ? purchaseCap(selectedVariant.stock, selectedVariant.maxPerOrder)
      : 0
    : purchaseCap(product.stock ?? 0);
  const availableStock = maxAllowed;

  const priceMin = product.priceMin ?? product.price;
  const priceMax = product.priceMax ?? product.price;
  const showRange = hasOptions && priceMin !== priceMax;

  const pieces = selectedVariant ? piecesFromPackLabel(selectedVariant.label) : null;
  const perPiece = pieces && pieces > 1 ? unitPrice / pieces : null;

  const hasDiscount =
    !hasOptions &&
    product.originalPrice !== undefined &&
    product.originalPrice > product.price;
  const percent =
    product.discountPercent ??
    (hasDiscount && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : undefined);

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, availableStock || 1)));
  }, [variantId, availableStock]);

  const needsSize = hasOptions && !selectedVariant;
  const needsColor = hasColors && !color;
  const canAdd = availableStock > 0 && !needsSize && !needsColor;

  const handleAdd = () => {
    setLimitMsg("");
    if (needsSize) {
      setLimitMsg("Please select a size first.");
      return;
    }
    if (needsColor) {
      setLimitMsg("Please select a color first.");
      return;
    }
    if (availableStock <= 0) return;

    const packLabel = selectedVariant?.label;
    const safeQty = Math.min(qty, availableStock);
    if (qty > availableStock && selectedVariant?.maxPerOrder) {
      setLimitMsg(
        `You can only buy ${selectedVariant.maxPerOrder} of size ${selectedVariant.label}. Please pick another size for the rest.`
      );
    }

    addItem(
      {
        productId: product.id,
        variantId: hasOptions ? selectedVariant?.id : undefined,
        variantLabel: packLabel,
        size: packLabel,
        brand: product.brand,
        name: product.name,
        image: product.image,
        price: unitPrice,
        maxStock: availableStock,
        color,
        href: product.href ?? `/product/${product.slug}`,
      },
      safeQty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const lineTotal = unitPrice * qty;
  const optionLooksLikeSize = variants.some((v) => /^\d{2}$/.test(v.label.trim()));

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
      <div>
        <div className="relative aspect-[4/3.2] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-6 sm:p-10"
          />
          {product.badge && (
            <span
              className={`absolute left-4 top-4 text-[11px] uppercase tracking-wide ${
                /sale/i.test(product.badge) ? "text-red-600" : "text-neutral-900"
              }`}
              style={{ fontFamily: "var(--font-anton), Anton, Impact, sans-serif" }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {gallery.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((src, index) => {
              const selected = src === activeImage;
              return (
                <li key={`${src}-${index}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImage(src)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selected}
                    className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-white sm:h-20 sm:w-20 ${
                      selected ? "border-[#4B0A6B]" : "border-neutral-200"
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-contain p-2" sizes="80px" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        {product.category && (
          <p className="text-sm text-neutral-500">{product.category}</p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {product.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {showRange ? (
            <p className="text-xl font-semibold text-[#4B0A6B]">
              {formatNaira(priceMin)} - {formatNaira(priceMax)}
            </p>
          ) : (
            <p className="text-xl font-semibold text-[#4B0A6B]">{formatNaira(unitPrice)}</p>
          )}
          {showRange && selectedVariant && (
            <p className="text-sm text-neutral-600">
              {selectedVariant.label}:{" "}
              <span className="font-semibold text-neutral-900">{formatNaira(unitPrice)}</span>
            </p>
          )}
          {perPiece !== null && (
            <p className="w-full text-sm text-neutral-500">
              About {formatNaira(perPiece)} per piece
            </p>
          )}
          {hasDiscount && product.originalPrice && (
            <p className="text-base text-neutral-400 line-through">
              {formatNaira(product.originalPrice)}
            </p>
          )}
          {percent !== undefined && (
            <p className="text-sm font-medium text-green-700">{percent}% off</p>
          )}
        </div>

        {product.description && (
          <p className="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {product.description}
          </p>
        )}

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          {product.brand ? (
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <dt className="text-neutral-500">Brand</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{product.brand}</dd>
            </div>
          ) : null}
          {product.sku && (
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <dt className="text-neutral-500">SKU</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{product.sku}</dd>
            </div>
          )}
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <dt className="text-neutral-500">Availability</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">
              {!hasOptions || selectedVariant ? (
                availableStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-green-700">
                    <span aria-hidden>✓</span>
                    {rawStock} in stock
                    {selectedVariant ? ` (${selectedVariant.label})` : ""}
                  </span>
                ) : (
                  "Out of stock"
                )
              ) : (
                <span className="text-amber-700">Select a size to see stock</span>
              )}
            </dd>
          </div>
        </dl>

        <div ref={optionsRef}>
        {hasOptions && (
          <div className={`mt-6 ${forcePick && needsSize ? "rounded-2xl ring-2 ring-[#4B0A6B] ring-offset-2 p-3" : ""}`}>
            <p className="text-sm font-medium text-neutral-800">
              {optionLooksLikeSize ? "Size" : "Size / option"}{" "}
              <span className="font-normal text-red-600">*</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Tap a size to select it. Stock shown is how many are left for that size.
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
              {variants.map((v) => {
                const selected = selectedVariant?.id === v.id;
                const soldOut = v.stock <= 0;
                const pcs = piecesFromPackLabel(v.label);
                const each = pcs && pcs > 1 ? v.price / pcs : null;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={soldOut}
                    onClick={() => {
                      setVariantId(v.id);
                      setLimitMsg("");
                    }}
                    className={`min-w-[4.5rem] rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected
                        ? "border-[#4B0A6B] bg-[#4B0A6B] text-white"
                        : "border-neutral-200 bg-white text-neutral-900 hover:border-[#4B0A6B]/50"
                    }`}
                  >
                    <span className="block font-semibold">{v.label}</span>
                    <span className={`mt-0.5 block text-xs ${selected ? "text-white/85" : "text-neutral-500"}`}>
                      {formatNaira(v.price)}
                      {soldOut ? " · sold out" : ` · ${v.stock} left`}
                    </span>
                    {v.maxPerOrder && v.maxPerOrder > 0 ? (
                      <span className={`mt-0.5 block text-[11px] ${selected ? "text-white/75" : "text-neutral-400"}`}>
                        Max {v.maxPerOrder} / order
                      </span>
                    ) : null}
                    {each !== null && (
                      <span className={`mt-0.5 block text-[11px] ${selected ? "text-white/75" : "text-neutral-400"}`}>
                        {formatNaira(each)}/pc
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasColors && (
          <div className={`mt-6 ${forcePick && needsColor ? "rounded-2xl ring-2 ring-[#4B0A6B] ring-offset-2 p-3" : ""}`}>
            <p className="text-sm font-medium text-neutral-800">
              Color <span className="font-normal text-red-600">*</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
              {product.colors!.map((c) => {
                const selected = color === c;
                const hex = isColorHex(c);
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Color ${c}`}
                    onClick={() => {
                      setColor(c);
                      setLimitMsg("");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "border-[#4B0A6B] bg-[#F8F1FA] text-[#4B0A6B]"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-[#4B0A6B]/40"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: hex ? c : "#e5e5e5" }}
                    />
                    {hex ? null : <span className="font-medium">{c}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {!hasOptions && !hasColors ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This product has no sizes or colors set in admin yet. Ask the store to add sizes
            (e.g. 40, 41, 45) with stock for each.
          </p>
        ) : null}

        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm font-medium text-neutral-800">Quantity</p>
            <p className="text-sm font-semibold text-neutral-900">
              Line total: {formatNaira(lineTotal)}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {BULK_QTY_PRESETS.filter((n) => n <= Math.max(availableStock, 1)).map((n) => (
              <button
                key={n}
                type="button"
                disabled={!selectedVariant && hasOptions ? true : n > availableStock}
                onClick={() => {
                  if (n > availableStock && selectedVariant?.maxPerOrder) {
                    setLimitMsg(
                      `You can only buy ${selectedVariant.maxPerOrder} of size ${selectedVariant.label}. Please pick another size.`
                    );
                    setQty(availableStock);
                    return;
                  }
                  setLimitMsg("");
                  setQty(n);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums disabled:opacity-40 ${
                  qty === n
                    ? "border-[#4B0A6B] bg-[#4B0A6B] text-white"
                    : "border-neutral-200 bg-white text-neutral-800 hover:border-[#4B0A6B]/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1.5">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={qty <= 1 || needsSize}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={Math.max(1, availableStock)}
              value={qty}
              disabled={needsSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                const capped = Math.min(Math.max(1, Math.floor(next)), Math.max(1, availableStock));
                if (
                  selectedVariant?.maxPerOrder &&
                  Math.floor(next) > selectedVariant.maxPerOrder
                ) {
                  setLimitMsg(
                    `You can only buy ${selectedVariant.maxPerOrder} of size ${selectedVariant.label}. Please pick another size.`
                  );
                } else {
                  setLimitMsg("");
                }
                setQty(capped);
              }}
              className="w-16 border-0 bg-transparent text-center text-sm font-semibold tabular-nums outline-none disabled:opacity-40"
              aria-label="Quantity"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={needsSize || qty >= availableStock}
              onClick={() => {
                if (qty >= availableStock && selectedVariant?.maxPerOrder) {
                  setLimitMsg(
                    `You can only buy ${selectedVariant.maxPerOrder} of size ${selectedVariant.label}. Please pick another size.`
                  );
                  return;
                }
                setQty((q) => Math.min(availableStock, q + 1));
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
            >
              +
            </button>
          </div>
          {availableStock > 0 && selectedVariant?.maxPerOrder ? (
            <p className="mt-2 text-xs text-neutral-500">
              Limit {selectedVariant.maxPerOrder} of size {selectedVariant.label} per order
              ({rawStock} in stock).
            </p>
          ) : availableStock > 0 ? (
            <p className="mt-2 text-xs text-neutral-500">
              Max {availableStock} available for this option.
            </p>
          ) : null}
          {limitMsg ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
              {limitMsg}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#4B0A6B] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#3a0854] disabled:opacity-50"
          >
            {added
              ? "Added to cart"
              : needsSize
                ? "Select a size"
                : needsColor
                  ? "Select a color"
                  : "Add to cart"}
          </button>
          <a
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-[#4B0A6B] hover:text-[#4B0A6B]"
          >
            View cart
          </a>
        </div>
      </div>
    </div>
  );
}
