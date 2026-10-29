"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import {
  colorsForSelection,
  isColorHex,
  piecesFromPackLabel,
} from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import {
  formatBonusOffer,
  unitPriceWithBonus,
} from "@/lib/quantityBonus";

const BULK_QTY_PRESETS = [1, 5, 10, 20, 50, 100];

function purchaseCap(stock: number, maxPerOrder?: number) {
  if (maxPerOrder && maxPerOrder > 0) return Math.min(stock, maxPerOrder);
  return stock;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, productQuantity, choiceQuantity } = useCart();
  const searchParams = useSearchParams();
  const optionsRef = useRef<HTMLDivElement>(null);
  const gallery = product.images?.length ? product.images : [product.image];
  const variants = product.variants ?? [];
  const hasOptions = variants.length > 0;
  const forcePick = searchParams.get("pick") === "1";
  const optionLooksLikeSize = variants.some((v) => {
    const t = v.label.trim();
    return /^\d{2,3}$/.test(t) || /^age\s*\d+/i.test(t) || /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(t);
  });
  const optionTitle = optionLooksLikeSize ? "Size" : "Option";
  const optionWord = optionTitle.toLowerCase();

  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitMsg, setLimitMsg] = useState("");

  const selectedVariant = useMemo(
    () => (variantId ? variants.find((v) => v.id === variantId) : undefined),
    [variants, variantId]
  );

  const availableColors = useMemo(
    () => colorsForSelection(product, selectedVariant),
    [product, selectedVariant]
  );
  const hasColors = availableColors.length > 0;
  const colorPickerReady = !hasOptions || Boolean(selectedVariant);
  const showColorPicker = hasColors && colorPickerReady;

  useEffect(() => {
    if (!forcePick) return;
    setLimitMsg(
      hasOptions && hasColors
        ? `Please select a ${optionWord} and color before adding to cart.`
        : hasOptions
          ? `Please select a ${optionWord} before adding to cart.`
          : hasColors
            ? "Please select a color before adding to cart."
            : ""
    );
    optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [forcePick, hasOptions, hasColors, optionWord]);

  useEffect(() => {
    if (!color) return;
    if (!availableColors.includes(color)) setColor(undefined);
  }, [availableColors, color]);

  const unitPrice = hasOptions ? selectedVariant?.price ?? product.price : product.price;
  const rawStock = hasOptions ? selectedVariant?.stock ?? 0 : product.stock ?? 0;
  const needsSize = hasOptions && !selectedVariant;
  // Color required only when sizes exist and this choice has colors.
  const needsColor = hasOptions && showColorPicker && !color;
  const choiceReady = !needsSize && !needsColor;
  /** Absolute max for this size/color line (stock ∩ maxPerOrder). */
  const choiceCap = hasOptions
    ? selectedVariant
      ? purchaseCap(selectedVariant.stock, selectedVariant.maxPerOrder)
      : 0
    : purchaseCap(product.stock ?? 0);
  const inCartForChoice = choiceReady
    ? choiceQuantity({
        productId: product.id,
        variantId: hasOptions ? selectedVariant?.id : undefined,
        color,
      })
    : 0;
  /** How many more of THIS size/color can still be added. Other choices stay separate. */
  const availableStock = Math.max(0, choiceCap - inCartForChoice);

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
    if (availableStock <= 0) {
      setQty(1);
      return;
    }
    setQty((q) => Math.min(Math.max(1, q), availableStock));
  }, [variantId, color, availableStock]);

  const canAdd = availableStock > 0 && choiceReady;

  const handleAdd = () => {
    setLimitMsg("");
    if (needsSize) {
      setLimitMsg(`Please select a ${optionWord} first.`);
      return;
    }
    if (needsColor) {
      setLimitMsg("Please select a color first.");
      return;
    }
    if (availableStock <= 0) {
      const label = selectedVariant?.label || "this option";
      setLimitMsg(
        `You already have the max for ${optionWord} ${label}${color ? ` / ${color}` : ""} in your cart. Pick another ${optionWord} or color to add more.`
      );
      return;
    }

    const packLabel = selectedVariant?.label;
    const safeQty = Math.min(qty, availableStock);
    const result = addItem(
      {
        productId: product.id,
        variantId: hasOptions ? selectedVariant?.id : undefined,
        variantLabel: packLabel,
        size: packLabel,
        brand: product.brand,
        name: product.name,
        image: product.image,
        price: unitPrice,
        maxStock: choiceCap,
        color,
        href: product.href ?? `/product/${product.slug}`,
        bonusQty: product.bonusQty,
        bonusPercent: product.bonusPercent,
      },
      safeQty
    );

    if (result.addedQty <= 0) {
      setLimitMsg(
        `That ${optionWord}${color ? " / color" : ""} is already at its limit in your cart. Pick another ${optionWord} or color.`
      );
      return;
    }

    setAdded(true);
    if (result.atLimit || selectedVariant?.maxPerOrder) {
      setLimitMsg(
        `Added ${result.addedQty}. Limit for this ${optionWord}${color ? " / color" : ""} is ${choiceCap}. You can still add a different ${optionWord} or color.`
      );
    } else {
      setLimitMsg("");
    }
    // Clear choice so they can immediately pick another size/color.
    setVariantId(undefined);
    setColor(undefined);
    setQty(1);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const bonusOffer = formatBonusOffer(product.bonusQty, product.bonusPercent);
  // Preview uses this pick qty plus what is already in the cart for the product.
  const previewProductQty = productQuantity(product.id) + qty;
  const previewUnit = unitPriceWithBonus(
    unitPrice,
    product.bonusQty,
    product.bonusPercent,
    previewProductQty
  );
  const lineTotal = previewUnit * qty;

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
        {product.brand ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#4B0A6B]">
            {product.brand}
          </p>
        ) : null}
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

        {bonusOffer ? (
          <p className="mt-2 text-sm font-medium text-[#4B0A6B]">{bonusOffer}</p>
        ) : null}

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
                <span className="text-amber-700">Select an option to see stock</span>
              )}
            </dd>
          </div>
        </dl>

        <div ref={optionsRef}>
        {hasOptions && (
          <div className={`mt-6 ${forcePick && needsSize ? "rounded-2xl ring-2 ring-[#4B0A6B] ring-offset-2 p-3" : ""}`}>
            <p className="text-sm font-medium text-neutral-800">
              {optionTitle} <span className="font-normal text-red-600">*</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Tap to select. Stock shown is how many are left for that {optionTitle.toLowerCase()}.
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={optionTitle}>
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
                      setColor(undefined);
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

        {hasOptions &&
        !selectedVariant &&
        (Boolean(product.colors?.length) ||
          variants.some((v) => Array.isArray(v.colors) && v.colors.length > 0)) ? (
          <p className="mt-4 text-xs text-neutral-500">
            Select a {optionWord} to see available colors for that option.
          </p>
        ) : null}

        {showColorPicker && (
          <div className={`mt-6 ${forcePick && needsColor ? "rounded-2xl ring-2 ring-[#4B0A6B] ring-offset-2 p-3" : ""}`}>
            <p className="text-sm font-medium text-neutral-800">
              Color{" "}
              {hasOptions ? (
                <span className="font-normal text-red-600">*</span>
              ) : (
                <span className="font-normal text-neutral-500">(optional)</span>
              )}
              {selectedVariant ? (
                <span className="font-normal text-neutral-500">
                  {" "}
                  for {selectedVariant.label}
                </span>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
              {availableColors.map((c) => {
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

        {!hasOptions ? (
          <p className="mt-6 text-xs text-neutral-500">
            No size or pack options on this product yet. It uses overall stock
            {showColorPicker ? "; color is optional" : ""}.
          </p>
        ) : null}

        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm font-medium text-neutral-800">Quantity</p>
            <p className="text-sm font-semibold text-neutral-900">
              Line total: {formatNaira(lineTotal)}
              {previewUnit < unitPrice ? (
                <span className="ml-2 text-xs font-medium text-emerald-700">
                  (bonus applied)
                </span>
              ) : null}
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
                      `You can only buy ${selectedVariant.maxPerOrder} of ${optionWord} ${selectedVariant.label}${color ? ` / ${color}` : ""}. Pick another ${optionWord} or color.`
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
                    `You can only buy ${selectedVariant.maxPerOrder} of ${optionWord} ${selectedVariant.label}${color ? ` / ${color}` : ""}. Pick another ${optionWord} or color.`
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
              disabled={needsSize || availableStock <= 0 || qty >= availableStock}
              onClick={() => {
                if (availableStock <= 0) {
                  setLimitMsg(
                    `This ${optionWord}${color ? " / color" : ""} is at its limit in your cart. Pick another ${optionWord} or color.`
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
          {choiceReady && selectedVariant?.maxPerOrder ? (
            <p className="mt-2 text-xs text-neutral-500">
              Limit {selectedVariant.maxPerOrder} of this {optionWord}
              {color ? ` / color` : ""} per order
              {inCartForChoice > 0 ? ` · ${inCartForChoice} already in cart` : ""}
              {availableStock > 0
                ? ` · ${availableStock} left to add`
                : " · limit reached for this choice"}
              . Other sizes or colors can still be added. ({rawStock} in stock).
            </p>
          ) : choiceReady && availableStock > 0 ? (
            <p className="mt-2 text-xs text-neutral-500">
              Max {availableStock} more available for this option
              {inCartForChoice > 0 ? ` (${inCartForChoice} already in cart)` : ""}.
            </p>
          ) : choiceReady && availableStock <= 0 ? (
            <p className="mt-2 text-xs text-amber-700">
              This {optionWord}
              {color ? " / color" : ""} is at its limit in your cart. Pick another{" "}
              {optionWord} or color to add more.
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
                ? `Select a ${optionTitle.toLowerCase()}`
                : needsColor
                  ? "Select a color"
                  : availableStock <= 0
                    ? `Pick another ${optionWord}`
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
