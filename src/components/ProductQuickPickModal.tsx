"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import {
  colorDisplayName,
  colorsForSelection,
  colorSwatchBackground,
  flattenedColorsForProduct,
  productHasRealSizes,
  stockForColorChoice,
  type FlatColorChoice,
} from "@/data/products";
import { formatNaira } from "@/lib/format";

function purchaseCap(stock: number, maxPerOrder?: number) {
  if (maxPerOrder && maxPerOrder > 0) return Math.min(stock, maxPerOrder);
  return stock;
}

type Props = {
  product: Product;
  initialQty?: number;
  open: boolean;
  onClose: () => void;
  onConfirm: (opts: {
    variantId?: string;
    variantLabel?: string;
    color?: string;
    price: number;
    maxStock: number;
    quantity: number;
  }) => void;
};

export default function ProductQuickPickModal({
  product,
  initialQty = 1,
  open,
  onClose,
  onConfirm,
}: Props) {
  const variants = product.variants ?? [];
  const hasSizes = variants.length > 0;
  /** Real shoe/clothing sizes only. Fake "1" options stay hidden. */
  const showSizePicker = hasSizes && productHasRealSizes(product);
  const colorOnlyMode = hasSizes && !showSizePicker;

  const { choiceQuantity } = useCart();
  const [variantId, setVariantId] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(initialQty);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState("");

  useEffect(() => {
    if (!open) return;
    setVariantId(undefined);
    setColor(undefined);
    setQty(Math.max(1, initialQty));
    setError("");
    setJustAdded("");
  }, [open, product.id, initialQty]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const selected = useMemo(
    () => (variantId ? variants.find((v) => v.id === variantId) : undefined),
    [variants, variantId]
  );

  const availableColors = useMemo((): FlatColorChoice[] => {
    if (colorOnlyMode) return flattenedColorsForProduct(product);
    return colorsForSelection(product, selected);
  }, [colorOnlyMode, product, selected]);
  const hasColors = availableColors.length > 0;
  const showColorPicker =
    hasColors && (colorOnlyMode || !hasSizes || Boolean(selected));

  useEffect(() => {
    if (!color) return;
    if (!availableColors.some((c) => c.color === color)) setColor(undefined);
  }, [availableColors, color]);

  const flatColor = colorOnlyMode
    ? availableColors.find((c) => c.color === color)
    : undefined;
  const unitPrice = colorOnlyMode
    ? flatColor?.price ?? product.price
    : hasSizes
      ? selected?.price ?? product.price
      : product.price;
  const needsSize = showSizePicker && !selected;
  const needsColor = showColorPicker && !color;
  const choiceReady = !needsSize && !needsColor;
  const choiceCap = colorOnlyMode
    ? purchaseCap(flatColor?.stock ?? 0, flatColor?.maxPerOrder)
    : hasSizes
      ? selected
        ? purchaseCap(
            showColorPicker
              ? stockForColorChoice(selected, color, selected.stock)
              : selected.stock,
            selected.maxPerOrder
          )
        : 0
      : purchaseCap(product.stock ?? 0);
  const inCartForChoice = choiceReady
    ? choiceQuantity({
        productId: product.id,
        variantId: hasSizes ? selected?.id ?? flatColor?.variantId : undefined,
        color,
      })
    : 0;
  const remaining = Math.max(0, choiceCap - inCartForChoice);

  useEffect(() => {
    if (remaining <= 0) {
      setQty(1);
      return;
    }
    setQty((q) => Math.min(Math.max(1, q), remaining));
  }, [variantId, color, remaining]);

  if (!open) return null;

  const canAdd = remaining > 0 && choiceReady;

  const handleAdd = () => {
    setError("");
    setJustAdded("");
    if (needsSize) {
      setError("Please select a size.");
      return;
    }
    if (needsColor) {
      setError("Please select a color.");
      return;
    }
    if (remaining <= 0) {
      setError("Nothing left to add for this choice.");
      return;
    }
    const safeQty = Math.min(qty, remaining);
    const resolvedVariantId = colorOnlyMode
      ? flatColor?.variantId
      : hasSizes
        ? selected?.id
        : undefined;
    const resolvedVariant = resolvedVariantId
      ? variants.find((v) => v.id === resolvedVariantId)
      : undefined;
    onConfirm({
      variantId: resolvedVariantId,
      variantLabel: resolvedVariant?.label,
      color,
      price: unitPrice,
      maxStock: choiceCap,
      quantity: safeQty,
    });
    setJustAdded(`Added ${safeQty}`);
    setVariantId(undefined);
    setColor(undefined);
    setQty(1);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-pick-title"
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <Image
              src={product.image}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            {product.brand ? (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4B0A6B]">
                {product.brand}
              </p>
            ) : null}
            <h2
              id="quick-pick-title"
              className="line-clamp-2 text-sm font-semibold text-neutral-900 sm:text-base"
            >
              {product.name}
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-[#4B0A6B]">
              {formatNaira(unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
          {showSizePicker ? (
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Size <span className="text-red-600">*</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label="Size">
                {variants.map((v) => {
                  const selectedSize = selected?.id === v.id;
                  const soldOut = v.stock <= 0;
                  const stockText = soldOut ? "sold out" : `${v.stock} in stock`;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedSize}
                      disabled={soldOut}
                      onClick={() => {
                        setVariantId(v.id);
                        setColor(undefined);
                        setError("");
                      }}
                      className={`bg-transparent p-0 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        selectedSize
                          ? "font-semibold text-[#4B0A6B] underline underline-offset-4"
                          : "font-medium text-neutral-800 hover:text-[#4B0A6B]"
                      }`}
                    >
                      {v.label} · {stockText}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showColorPicker ? (
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Color <span className="text-red-600">*</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label="Color">
                {availableColors.map((entry) => {
                  const selectedColor = color === entry.color;
                  const label = colorDisplayName(entry.color);
                  const soldOut = entry.stock <= 0;
                  const stockText = soldOut ? "sold out" : `${entry.stock} in stock`;
                  return (
                    <button
                      key={entry.color}
                      type="button"
                      role="radio"
                      aria-checked={selectedColor}
                      aria-label={`${label} · ${stockText}`}
                      disabled={soldOut}
                      onClick={() => {
                        setColor(entry.color);
                        if (colorOnlyMode && entry.variantId) {
                          setVariantId(entry.variantId);
                        }
                        setError("");
                      }}
                      className={`inline-flex items-center gap-2 bg-transparent p-0 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        selectedColor
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
          ) : null}

          <div>
            <p className="text-sm font-medium text-neutral-800">Quantity</p>
            <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1.5">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1 || needsSize || remaining <= 0}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={needsSize || remaining <= 0 || qty >= remaining}
                onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {justAdded ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
              {justAdded}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-neutral-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex w-full items-center justify-center rounded-xl bg-[#4B0A6B] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#3a0854] disabled:opacity-50"
          >
            {needsSize
              ? "Select a size"
              : needsColor
                ? "Select a color"
                : remaining <= 0
                  ? "Pick another color"
                  : justAdded
                    ? `Add another · ${formatNaira(unitPrice * qty)}`
                    : `Add to cart · ${formatNaira(unitPrice * qty)}`}
          </button>
          {justAdded ? (
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 hover:border-[#4B0A6B] hover:text-[#4B0A6B]"
            >
              Done
            </button>
          ) : (
            <Link
              href={product.href || `/product/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs font-medium text-neutral-500 hover:text-[#4B0A6B]"
            >
              View full details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
