"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  productRequiresOptions,
  productSizeLabels,
  type Product,
} from "@/data/products";
import { addProductFromCard } from "@/lib/addProductFromCard";

interface NewArrivalsProps {
  products?: Product[];
  onAdd?: (product: Product, quantity: number) => void;
  autoPlay?: boolean;
  interval?: number;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  perks?: string[];
  viewAllLabel?: string;
  viewAllHref?: string;
}

const MIN_PRODUCTS_TO_LOOP = 5;
const GAP_PX = 16;

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous products" : "Next products"}
      className={`absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-700 shadow-lg transition-colors hover:bg-[#6B0080] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        direction === "left" ? "left-0 sm:-left-4" : "right-0 sm:-right-4"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {direction === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

export default function NewArrivals({
  products = [],
  onAdd,
  autoPlay = true,
  interval = 4000,
  title = "Just landed at Attog Store",
  subtitle = "Our newest pieces, handpicked and ready to ship. Be the first to get them.",
  backgroundImage = "/assets/hero8.png",
  overlayOpacity = 0.82,
  perks = ["New styles every week", "Fast, reliable delivery", "Easy returns"],
  viewAllLabel = "Shop all new arrivals",
  viewAllHref = "/shop",
}: NewArrivalsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const scroller = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const paused = useRef(false);

  const loop = products.length >= MIN_PRODUCTS_TO_LOOP;
  const copies = loop ? [0, 1, 2] : [1];

  const getSlidePitch = useCallback((): number => {
    const el = scroller.current;
    if (!el || el.children.length < 2) {
      const first = el?.children[0] as HTMLElement | undefined;
      return first ? first.offsetWidth + GAP_PX : 0;
    }
    return (
      (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft
    );
  }, []);

  const getSetWidth = useCallback((): number => {
    const el = scroller.current;
    if (!el || !loop) return 0;
    const first = el.children[0] as HTMLElement | undefined;
    const firstOfSecond = el.children[products.length] as HTMLElement | undefined;
    if (!first || !firstOfSecond) return 0;
    return firstOfSecond.offsetLeft - first.offsetLeft;
  }, [loop, products.length]);

  const jumpTo = (left: number) => {
    const el = scroller.current;
    if (!el) return;
    el.style.scrollBehavior = "auto";
    el.style.scrollSnapType = "none";
    el.scrollLeft = left;
    requestAnimationFrame(() => {
      el.style.scrollBehavior = "";
      el.style.scrollSnapType = "";
    });
  };

  useLayoutEffect(() => {
    if (loop) jumpTo(getSetWidth());
  }, [loop, getSetWidth]);

  const onScroll = () => {
    if (!loop) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = scroller.current;
      if (!el) return;
      const set = getSetWidth();
      if (!set) return;
      if (el.scrollLeft < set * 0.5) jumpTo(el.scrollLeft + set);
      else if (el.scrollLeft > set * 1.5) jumpTo(el.scrollLeft - set);
    }, 120);
  };

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  useEffect(() => {
    if (!autoPlay || products.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = scroller.current;
      if (!el || paused.current) return;
      const pitch = getSlidePitch();
      if (!pitch) return;
      el.scrollBy({ left: pitch, behavior: "smooth" });
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, products.length, getSlidePitch]);

  const scrollBySlide = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const pitch = getSlidePitch();
    if (!pitch) return;
    el.scrollBy({ left: dir * pitch, behavior: "smooth" });
  };

  return (
    <section
      className="relative isolate overflow-hidden section-y"
      aria-labelledby="new-arrivals-title"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
      onTouchStart={() => {
        paused.current = true;
      }}
      onTouchEnd={() => {
        paused.current = false;
      }}
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[#070B24]"
        style={{ opacity: overlayOpacity }}
      />

      <div className="container-page relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-12">
        <div className="shrink-0 lg:w-[240px] xl:w-[260px]">
          <h2
            id="new-arrivals-title"
            className="font-[family-name:var(--font-anton)] text-3xl uppercase leading-none tracking-wide text-white sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-white/85">{subtitle}</p>

          <ul className="mt-5 space-y-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-[#E9A6FF]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12l5 5 9-10" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>

          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="mt-6 inline-flex items-center rounded-full border border-white px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-[#070B24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {viewAllLabel}
            </Link>
          ) : null}
        </div>

        <div className="relative min-w-0 flex-1">
          {products.length > 1 ? (
            <>
              <ArrowButton direction="left" onClick={() => scrollBySlide(-1)} />
              <ArrowButton direction="right" onClick={() => scrollBySlide(1)} />
            </>
          ) : null}

          <div
            ref={scroller}
            onScroll={onScroll}
            className="flex h-[380px] flex-nowrap items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:h-[400px]"
          >
            {products.length === 0 ? (
              <p className="py-10 text-sm text-white/80">New arrivals will show here soon.</p>
            ) : (
              copies.map((copy) =>
                products.map((product) => (
                  <div
                    key={`${copy}-${product.id}`}
                    className="flex h-full min-h-0 shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-white shadow-xl shadow-black/25 w-[calc((100%-0px)/1)] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]"
                    aria-hidden={loop && copy !== 1 ? true : undefined}
                  >
                    <ProductCard
                      name={product.name}
                      image={product.image}
                      price={product.priceMin ?? product.price}
                      priceMax={product.priceMax}
                      href={product.href}
                      badge={product.badge}
                      originalPrice={product.originalPrice}
                      discountPercent={product.discountPercent}
                      requiresOptions={productRequiresOptions(product)}
                      optionsHint={
                        productSizeLabels(product).length
                          ? `Sizes: ${productSizeLabels(product).slice(0, 6).join(", ")}`
                          : undefined
                      }
                      isWishlisted={has(product.id) || has(product.slug)}
                      onWishlistToggle={() => {
                        void toggle(product);
                      }}
                      compact
                      priority={copy === 1}
                      className="h-full"
                      onAdd={(quantity) => {
                        if (onAdd) {
                          onAdd(product, quantity);
                          return;
                        }
                        addProductFromCard({
                          product,
                          quantity,
                          addItem,
                          toast,
                          navigate: (href) => router.push(href),
                        });
                      }}
                    />
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
