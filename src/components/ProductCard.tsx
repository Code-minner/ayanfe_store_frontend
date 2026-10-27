"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/* ---------- TYPES ---------- */

export interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  /** When set and different from price, show a from-to range (pack variants). */
  priceMax?: number;
  href?: string;

  imageAlt?: string;
  badge?: string;
  category?: string;
  brand?: string;
  subtitle?: string;
  /** Color swatches shown on the card (hex or name). */
  colors?: string[];
  originalPrice?: number;
  discountPercent?: number;
  /** Buy this many units to unlock bonusPercent off. */
  bonusQty?: number;
  bonusPercent?: number;

  isWishlisted?: boolean;
  onWishlistToggle?: (wishlisted: boolean) => void;
  /** Called when the purple add button is pressed, with the current quantity. */
  onAdd?: (quantity: number) => void;
  /** Controlled quantity. Omit to manage quantity inside the card. */
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
  /** Faster LCP for above-the-fold cards */
  priority?: boolean;
  /** Tighter layout for carousels / narrow slides. */
  compact?: boolean;
  /** When true, card add sends shopper to pick size/color. */
  requiresOptions?: boolean;
  /** e.g. "Sizes: 40, 41, 42" shown under the title. */
  optionsHint?: string;
  /** Still listed, but cannot buy until restocked. */
  outOfStock?: boolean;
}

/* ---------- HELPERS ---------- */

const formatNaira = (value: number): string => `₦${value.toLocaleString("en-NG")}`;

/* ---------- COMPONENT ---------- */

export default function ProductCard({
  name,
  image,
  price,
  priceMax,
  href,
  imageAlt,
  badge,
  category,
  brand,
  subtitle,
  colors,
  originalPrice,
  discountPercent,
  bonusQty,
  bonusPercent,
  isWishlisted,
  onWishlistToggle,
  onAdd,
  quantity: controlledQty,
  onQuantityChange,
  className = "",
  priority = false,
  compact = false,
  requiresOptions = false,
  optionsHint,
  outOfStock = false,
}: ProductCardProps) {
  const [localQty, setLocalQty] = useState(1);
  const [heartPop, setHeartPop] = useState(false);
  const [cartPop, setCartPop] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const wishlisted = Boolean(isWishlisted);
  const qty = controlledQty ?? localQty;
  const showRange = priceMax !== undefined && priceMax > price;
  const remoteHost =
    typeof image === "string" && /^https?:\/\//i.test(image)
      ? (() => {
          try {
            return new URL(image).hostname;
          } catch {
            return "";
          }
        })()
      : "";
  // WordPress / non-Cloudinary hosts often break next/image optimization; serve directly.
  const useUnoptimized =
    Boolean(remoteHost) && !remoteHost.includes("res.cloudinary.com");

  const hasDiscount = !showRange && originalPrice !== undefined && originalPrice > price;
  const percent =
    discountPercent ??
    (hasDiscount ? Math.round((1 - price / originalPrice) * 100) : undefined);
  const bonusOffer =
    typeof bonusQty === "number" &&
    bonusQty >= 1 &&
    typeof bonusPercent === "number" &&
    bonusPercent > 0
      ? `Buy ${bonusQty}+, get ${bonusPercent}% off`
      : null;

  const setQty = (next: number) => {
    const value = Math.max(1, next);
    setLocalQty(value);
    onQuantityChange?.(value);
  };

  const toggleWishlist = () => {
    setHeartPop(true);
    window.setTimeout(() => setHeartPop(false), 380);
    onWishlistToggle?.(!wishlisted);
  };

  const handleAdd = () => {
    if (outOfStock && !requiresOptions) return;
    setCartPop(true);
    window.setTimeout(() => setCartPop(false), 280);
    onAdd?.(qty);
  };

  const title = (
    <h3
      className={`font-medium leading-snug text-neutral-900 ${
        compact ? "line-clamp-2 min-h-[2.5rem] text-sm" : "text-base"
      }`}
    >
      {name}
    </h3>
  );

  const qtyBtn =
    "grid h-7 w-7 place-items-center rounded-full border border-neutral-300 text-neutral-800 transition-colors hover:border-[#4B0A6B] hover:text-[#4B0A6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <article className={`flex h-full w-full min-w-0 flex-col ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-white ${
          compact
            ? "min-h-0 flex-1 rounded-t-xl"
            : "aspect-[4/3.4] rounded-xl border border-neutral-200"
        }`}
      >
        {!imgLoaded && !imgFailed && (
          <div className="absolute inset-0 animate-shimmer" aria-hidden />
        )}
        {imgFailed ? (
          <div className="absolute inset-0 grid place-items-center bg-neutral-50 text-xs text-neutral-400">
            No image
          </div>
        ) : href ? (
          <Link href={href} aria-label={name} className="absolute inset-0 block">
            <Image
              src={image}
              alt={imageAlt ?? name}
              fill
              priority={priority}
              unoptimized={useUnoptimized}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-contain p-4 transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
            />
          </Link>
        ) : (
          <Image
            src={image}
            alt={imageAlt ?? name}
            fill
            priority={priority}
            unoptimized={useUnoptimized}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-contain p-4 transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        )}

        {outOfStock ? (
          <span
            className="absolute left-3 top-3 rounded bg-neutral-900/85 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white"
            style={{ fontFamily: "var(--font-anton), Anton, Impact, sans-serif", fontWeight: 400 }}
          >
            Out of stock
          </span>
        ) : badge ? (
          <span
            className={`absolute left-3 top-3 text-[11px] uppercase tracking-wide ${
              /sale/i.test(badge) ? "text-red-600" : "text-neutral-900"
            }`}
            style={{ fontFamily: "var(--font-anton), Anton, Impact, sans-serif", fontWeight: 400 }}
          >
            {badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:text-[#4B0A6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B]"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${heartPop ? "animate-heart-pop" : ""}`}
            fill={wishlisted ? "#4B0A6B" : "none"}
            stroke={wishlisted ? "#4B0A6B" : "currentColor"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.4 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.5 0 5.5 3.4 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
          </svg>
        </button>
      </div>

      <div
        className={`flex items-start justify-between gap-2 ${
          compact ? "min-h-[100px] shrink-0 p-3 pt-2.5" : "mt-3 flex-1"
        }`}
      >
        <div className="min-w-0 flex-1">
          {!compact && category ? (
            <p className="text-sm text-neutral-400">{category}</p>
          ) : null}

          {brand ? (
            <p
              className={`font-medium uppercase tracking-wide text-[#4B0A6B] ${
                compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"
              }`}
            >
              {brand}
            </p>
          ) : null}

          {href ? (
            <Link href={href} className="block hover:text-[#4B0A6B]">
              {title}
            </Link>
          ) : (
            title
          )}

          {colors && colors.length > 0 ? (
            <div
              className={`flex flex-wrap items-center gap-1 ${compact ? "mt-1" : "mt-1.5"}`}
              aria-label="Available colors"
            >
              {colors.slice(0, 6).map((c) => {
                const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim());
                return (
                  <span
                    key={c}
                    title={c}
                    className={`rounded-full border border-neutral-300 ${
                      compact ? "h-3 w-3" : "h-3.5 w-3.5"
                    }`}
                    style={{ backgroundColor: hex ? c.trim() : "#e5e5e5" }}
                  />
                );
              })}
              {colors.length > 6 ? (
                <span className="text-[10px] text-neutral-400">+{colors.length - 6}</span>
              ) : null}
            </div>
          ) : null}

          {!compact ? (
            <div className="mt-2 flex items-center gap-2" aria-label={`Quantity for ${name}`}>
              <button
                type="button"
                onClick={() => setQty(qty - 1)}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className={qtyBtn}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
              <span className="min-w-6 text-center text-sm font-medium tabular-nums text-neutral-900">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
                className={qtyBtn}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : null}

          {!compact && (optionsHint || subtitle) ? (
            <p className="mt-1 text-sm text-neutral-500">{optionsHint || subtitle}</p>
          ) : null}
          {compact && optionsHint ? (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-neutral-500">{optionsHint}</p>
          ) : null}

          <p
            className={`mt-1.5 flex flex-wrap items-baseline gap-x-2 font-medium text-neutral-900 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            <span className="truncate">
              {showRange
                ? `${formatNaira(price)} - ${formatNaira(priceMax)}`
                : formatNaira(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-normal text-neutral-400 line-through sm:text-sm">
                {formatNaira(originalPrice)}
              </span>
            )}
            {percent !== undefined && (
              <span className="text-xs font-normal text-green-700 sm:text-sm">{percent}% off</span>
            )}
          </p>
          {bonusOffer ? (
            <p
              className={`mt-1 font-medium text-[#4B0A6B] ${
                compact ? "text-[11px]" : "text-xs"
              }`}
            >
              {bonusOffer}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock && !requiresOptions}
          aria-label={
            outOfStock && !requiresOptions
              ? `${name} is out of stock`
              : requiresOptions
                ? `Pick options and add ${name} to cart`
                : `Add ${qty} ${name} to cart`
          }
          title={
            outOfStock && !requiresOptions
              ? "Out of stock"
              : requiresOptions
                ? "Pick size / color"
                : "Add to cart"
          }
          className={`grid shrink-0 place-items-center rounded-full bg-[#4B0A6B] text-white transition-colors hover:bg-purple-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-900 disabled:cursor-not-allowed disabled:bg-neutral-400 ${
            compact ? "h-9 w-9" : "h-11 w-11"
          } ${cartPop ? "animate-cart-pop" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </article>
  );
}
