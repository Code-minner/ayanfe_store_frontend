"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import {
  bonusApplies,
  formatBonusOffer,
  unitPriceWithBonus,
} from "@/lib/quantityBonus";

interface CartItemRowProps {
  item: CartItem;
  /** Total units of this product across all cart lines (sizes/colors). */
  productQty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItemRow({
  item,
  productQty,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const unit = unitPriceWithBonus(
    item.price,
    item.bonusQty,
    item.bonusPercent,
    productQty
  );
  const lineTotal = unit * item.quantity;
  const unlocked = bonusApplies(item.bonusQty, item.bonusPercent, productQty);
  const offer = formatBonusOffer(item.bonusQty, item.bonusPercent);
  const needMore =
    offer && item.bonusQty && !unlocked
      ? Math.max(0, item.bonusQty - productQty)
      : 0;

  const name = item.href ? (
    <Link href={item.href} className="font-medium text-neutral-900 hover:text-[#4B0A6B]">
      {item.name}
    </Link>
  ) : (
    <span className="font-medium text-neutral-900">{item.name}</span>
  );

  return (
    <article className="flex flex-col gap-4 border-b border-neutral-100 py-5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white sm:h-[72px] sm:w-[72px]">
          <Image src={item.image} alt="" fill sizes="72px" className="object-contain p-1.5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm sm:text-base">{name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {item.brand && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                {item.brand}
              </span>
            )}
            {(item.size || item.variantLabel) && (
              <span className="rounded-full bg-[#F8F1FA] px-2 py-0.5 text-[11px] font-medium text-[#4B0A6B]">
                {(() => {
                  const label = (item.size || item.variantLabel || "").trim();
                  const isSize =
                    /^\d{2,3}$/.test(label) ||
                    /^age\s*\d+/i.test(label) ||
                    /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(label);
                  return `${isSize ? "Size" : "Option"}: ${label}`;
                })()}
              </span>
            )}
            {item.color && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600">
                <span
                  className="inline-block h-3.5 w-3.5 rounded-[3px] border border-neutral-300"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                {item.color}
              </span>
            )}
            <p className="text-sm text-neutral-700">
              {unlocked && unit < item.price ? (
                <>
                  <span className="font-medium text-emerald-700">{formatNaira(unit)}</span>
                  <span className="ml-1 text-neutral-400 line-through">{formatNaira(item.price)}</span>
                  <span className="ml-1">each</span>
                </>
              ) : (
                <>{formatNaira(item.price)} each</>
              )}
            </p>
          </div>
          {offer ? (
            <p
              className={`mt-1 text-xs ${
                unlocked ? "font-medium text-emerald-700" : "text-neutral-500"
              }`}
            >
              {unlocked
                ? `${offer} applied`
                : needMore > 0
                  ? `${offer}. Add ${needMore} more to unlock.`
                  : offer}
            </p>
          ) : null}
          {item.maxStock !== undefined && (
            <p className="mt-1 text-xs text-neutral-500">
              {item.quantity >= item.maxStock
                ? `Limit ${item.maxStock} for this size/color. Other options can still be added.`
                : `${item.maxStock} max for this size/color`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-6">
        <div className="flex items-center gap-2.5" aria-label={`Quantity for ${item.name}`}>
          <button
            type="button"
            onClick={onDecrement}
            aria-label="Decrease quantity"
            className="grid h-8 w-8 place-items-center rounded-full bg-[#E11D48] text-white transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <span className="min-w-5 text-center text-sm font-medium tabular-nums text-neutral-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            aria-label="Increase quantity"
            disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
            title={
              item.maxStock !== undefined && item.quantity >= item.maxStock
                ? "Limit reached for this size/color. Add a different size or color instead."
                : "Increase quantity"
            }
            className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="min-w-[6.5rem] text-right text-sm font-medium text-neutral-900">
          x {formatNaira(lineTotal)}
        </p>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-600"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}
