"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import {
  colorDisplayName,
  colorsForSelection,
  colorSwatchBackground,
  piecesFromPackLabel,
  stockForColorChoice,
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
    if (!availableColors.some((c) => c.color === color)) setColor(undefined);
  }, [availableColors, color]);

  const unitPrice = hasOptions ? selectedVariant?.price ?? product.price : product.price;
  const colorStock = stockForColorChoice(
    selectedVariant,
    color,
    product.stock ?? 0
  );
  const rawStock = hasOptions
    ? showColorPicker && color
      ? colorStock
      : selectedVariant?.stock ?? 0
    : product.stock ?? 0;
  const needsSize = hasOptions && !selectedVariant;
  // Color required only when sizes exist and this choice has colors.
  const needsColor = hasOptions && showColorPicker && !color;
  const choiceReady = !needsSize && !needsColor;
  /** Absolute max for this size/color line (stock ∩ maxPerOrder). */
  const choiceCap = hasOptions
    ? selectedVariant
      ? purchaseCap(
          showColorPicker
            ? stockForColorChoice(selectedVariant, color, selectedVariant.stock)
            : selectedVariant.stock,
          selectedVariant.maxPerOrder
        )
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
      setLimitMsg("Nothing left to add for this choice.");
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
      setLimitMsg("Nothing left to add for this choice.");
      return;
    }

    setAdded(true);
    setLimitMsg("");
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
          <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
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

        <dl className="mt-5 space-y-1.5 text-sm">
          {product.sku ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-neutral-500">SKU</dt>
              <dd className="font-medium text-neutral-800">{product.sku}</dd>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-neutral-500">Availability</dt>
            <dd className="font-medium">
              {!hasOptions || selectedVariant ? (
                rawStock > 0 ? (
                  <span className="text-green-700">{rawStock} in stock</span>
                ) : (
                  <span className="text-neutral-800">Out of stock</span>
                )
              ) : (
                <span className="text-neutral-500">Select an option</span>
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
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label={optionTitle}>
              {variants.map((v) => {
                const selected = selectedVariant?.id === v.id;
                const soldOut = v.stock <= 0;
                const stockText = soldOut ? "sold out" : `${v.stock} in stock`;
                // Skip repeating tiny labels like "1" when stock is the useful info.
                const showLabel = v.label.trim() && !/^\d{1,2}$/.test(v.label.trim());
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
                    className={`bg-transparent p-0 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected
                        ? "font-semibold text-[#4B0A6B] underline underline-offset-4"
                        : "font-medium text-neutral-800 hover:text-[#4B0A6B]"
                    }`}
                  >
                    {showLabel ? `${v.label} · ${stockText}` : stockText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showColorPicker && (
          <div className={`mt-6 ${forcePick && needsColor ? "rounded-2xl ring-2 ring-[#4B0A6B] ring-offset-2 p-3" : ""}`}>
            <p className="text-sm font-medium text-neutral-800">
              Color{" "}
              {hasOptions ? <span className="font-normal text-red-600">*</span> : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label="Color">
              {availableColors.map((entry) => {
                const selected = color === entry.color;
                const label = colorDisplayName(entry.color);
                const soldOut = entry.stock <= 0;
                const stockText = soldOut ? "sold out" : `${entry.stock} in stock`;
                return (
                  <button
                    key={entry.color}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${label} · ${stockText}`}
                    disabled={soldOut}
                    onClick={() => {
                      setColor(entry.color);
                      setLimitMsg("");
                    }}
                    className={`inline-flex items-center gap-2 bg-transparent p-0 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected
                        ? "font-semibold text-[#4B0A6B] underline underline-offset-4"
                        : "font-medium text-neutral-800 hover:text-[#4B0A6B]"
                    }`}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-neutral-300"
                      style={{ backgroundColor: colorSwatchBackground(entry.color) }}
                    />
                    <span>
                      {label} · {stockText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>

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
                  if (n > availableStock) {
                    setLimitMsg(
                      availableStock > 0
                        ? `Only ${availableStock} left for this choice.`
                        : "This choice is out of stock in your cart limit."
                    );
                    setQty(Math.max(1, availableStock));
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
                if (Math.floor(next) > availableStock && availableStock > 0) {
                  setLimitMsg(`Only ${availableStock} left for this choice.`);
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
                  setLimitMsg("Nothing left to add for this choice.");
                  return;
                }
                setQty((q) => Math.min(availableStock, q + 1));
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
            >
              +
            </button>
          </div>
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
