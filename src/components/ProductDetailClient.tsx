"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { piecesFromPackLabel } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";

const BULK_QTY_PRESETS = [1, 5, 10, 20, 50, 100];

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const gallery = product.images?.length ? product.images : [product.image];
  const variants = product.variants ?? [];
  const hasPacks = variants.length > 0;

  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const [color, setColor] = useState(product.colors?.[0]);
  const [variantId, setVariantId] = useState(
    () => variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId]
  );

  const unitPrice = hasPacks ? selectedVariant?.price ?? product.price : product.price;
  const availableStock = hasPacks
    ? selectedVariant?.stock ?? 0
    : product.stock ?? 0;

  const priceMin = product.priceMin ?? product.price;
  const priceMax = product.priceMax ?? product.price;
  const showRange = hasPacks && priceMin !== priceMax;

  const pieces = selectedVariant ? piecesFromPackLabel(selectedVariant.label) : null;
  const perPiece =
    pieces && pieces > 1 ? unitPrice / pieces : null;

  const hasDiscount =
    !hasPacks &&
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

  const handleAdd = () => {
    if (availableStock <= 0) return;
    const packLabel = selectedVariant?.label;
    const safeQty = Math.min(qty, availableStock);
    addItem(
      {
        productId: product.id,
        variantId: hasPacks ? selectedVariant?.id : undefined,
        variantLabel: packLabel,
        name: packLabel ? `${product.name} - ${packLabel}` : product.name,
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
          {product.sku && (
            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <dt className="text-neutral-500">SKU</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{product.sku}</dd>
            </div>
          )}
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <dt className="text-neutral-500">Availability</dt>
            <dd className="mt-0.5 font-medium text-neutral-900">
              {availableStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-green-700">
                  <span aria-hidden>✓</span>
                  {availableStock} in stock
                  {selectedVariant ? ` (${selectedVariant.label})` : ""}
                </span>
              ) : (
                "Out of stock"
              )}
            </dd>
          </div>
        </dl>

        {hasPacks && (
          <div className="mt-6">
            <p className="text-sm font-medium text-neutral-800">
              Buy in packs <span className="font-normal text-neutral-500">(wholesale friendly)</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Pack size">
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
                    onClick={() => setVariantId(v.id)}
                    className={`min-w-[7.5rem] rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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

        {product.colors && product.colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-neutral-800">Color</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
              {product.colors.map((c) => {
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Color ${c}`}
                    onClick={() => setColor(c)}
                    className={`h-9 w-9 rounded-full border-2 ${
                      selected ? "border-[#4B0A6B]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm font-medium text-neutral-800">
              Quantity {hasPacks ? "(number of packs)" : ""}
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              Line total: {formatNaira(lineTotal)}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {BULK_QTY_PRESETS.filter((n) => n <= Math.max(availableStock, 1)).map((n) => (
              <button
                key={n}
                type="button"
                disabled={n > availableStock}
                onClick={() => setQty(n)}
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
              disabled={qty <= 1}
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
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                setQty(Math.min(Math.max(1, Math.floor(next)), Math.max(1, availableStock)));
              }}
              className="w-16 border-0 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
              aria-label="Pack quantity"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={qty >= availableStock}
              onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
            >
              +
            </button>
          </div>
          {availableStock > 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              Max {availableStock} {hasPacks ? "packs" : "units"} available for this option.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAdd}
            disabled={availableStock <= 0 || (hasPacks && !selectedVariant)}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#4B0A6B] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#3a0854] disabled:opacity-50"
          >
            {added ? "Added to cart" : "Add to cart"}
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
