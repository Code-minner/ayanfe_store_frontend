"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import { colorsForSelection, isColorHex } from "@/data/products";
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
  const optionLooksLikeSize = variants.some((v) => {
    const t = v.label.trim();
    return /^\d{2,3}$/.test(t) || /^age\s*\d+/i.test(t) || /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(t);
  });
  const optionTitle = optionLooksLikeSize ? "Size" : "Option";

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

  const availableColors = useMemo(
    () => colorsForSelection(product, selected),
    [product, selected]
  );
  const hasColors = availableColors.length > 0;
  const showColorPicker = hasColors && (!hasSizes || Boolean(selected));

  useEffect(() => {
    if (!color) return;
    if (!availableColors.includes(color)) setColor(undefined);
  }, [availableColors, color]);

  const unitPrice = hasSizes ? selected?.price ?? product.price : product.price;
  const needsSize = hasSizes && !selected;
  const needsColor = hasSizes && showColorPicker && !color;
  const choiceReady = !needsSize && !needsColor;
  const choiceCap = hasSizes
    ? selected
      ? purchaseCap(selected.stock, selected.maxPerOrder)
      : 0
    : purchaseCap(product.stock ?? 0);
  const inCartForChoice = choiceReady
    ? choiceQuantity({
        productId: product.id,
        variantId: hasSizes ? selected?.id : undefined,
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
      setError(`Please select a ${optionTitle.toLowerCase()}.`);
      return;
    }
    if (needsColor) {
      setError("Please select a color.");
      return;
    }
    if (remaining <= 0) {
      setError(
        `You already have the max for this ${optionTitle.toLowerCase()}${color ? " / color" : ""} in your cart. Pick another ${optionTitle.toLowerCase()} or color.`
      );
      return;
    }
    const safeQty = Math.min(qty, remaining);
    const labelBits = [selected?.label, color].filter(Boolean).join(" · ");
    onConfirm({
      variantId: hasSizes ? selected?.id : undefined,
      variantLabel: selected?.label,
      color,
      price: unitPrice,
      maxStock: choiceCap,
      quantity: safeQty,
    });
    setJustAdded(
      labelBits
        ? `Added ${safeQty}× ${labelBits}. Pick another ${optionTitle.toLowerCase()} or color to add more.`
        : `Added ${safeQty}. You can pick another option to add more.`
    );
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
          {hasSizes ? (
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {optionTitle} <span className="text-red-600">*</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={optionTitle}>
                {variants.map((v) => {
                  const selectedSize = selected?.id === v.id;
                  const soldOut = v.stock <= 0;
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
                      className={`min-w-[3.25rem] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        selectedSize
                          ? "border-[#4B0A6B] bg-[#4B0A6B] text-white"
                          : "border-neutral-200 bg-white text-neutral-900 hover:border-[#4B0A6B]/50"
                      }`}
                    >
                      {v.label}
                      {!soldOut ? (
                        <span
                          className={`mt-0.5 block text-[10px] font-normal ${
                            selectedSize ? "text-white/80" : "text-neutral-500"
                          }`}
                        >
                          {v.stock} left
                        </span>
                      ) : (
                        <span className="mt-0.5 block text-[10px] font-normal">Sold out</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {hasSizes &&
          !selected &&
          (Boolean(product.colors?.length) ||
            variants.some((v) => Array.isArray(v.colors) && v.colors.length > 0)) ? (
            <p className="text-xs text-neutral-500">
              Select a {optionTitle.toLowerCase()} to see colors for that option.
            </p>
          ) : null}

          {showColorPicker ? (
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Color <span className="text-red-600">*</span>
                {selected ? (
                  <span className="font-normal text-neutral-500">
                    {" "}
                    for {selected.label}
                  </span>
                ) : null}
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
                {availableColors.map((c) => {
                  const selectedColor = color === c;
                  const hex = isColorHex(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={selectedColor}
                      aria-label={`Color ${c}`}
                      onClick={() => {
                        setColor(c);
                        setError("");
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                        selectedColor
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
          ) : null}

          <div>
            <p className="text-sm font-medium text-neutral-800">Quantity</p>
            {choiceReady && selected?.maxPerOrder && selected.maxPerOrder > 0 ? (
              <p className="mt-1 text-xs text-neutral-500">
                Max {selected.maxPerOrder} of this {optionTitle.toLowerCase()}
                {color ? ` / color` : ""} per order
                {inCartForChoice > 0 ? ` · ${inCartForChoice} already in cart` : ""}
                {remaining > 0 ? ` · ${remaining} left to add` : " · limit reached"}. Other sizes
                or colors can still be added.
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500">
                Limits apply per size and color. After the max for one choice, pick another.
              </p>
            )}
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
              ? `Select a ${optionTitle.toLowerCase()}`
              : needsColor
                ? "Select a color"
                : remaining <= 0
                  ? "Pick another size or color"
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
