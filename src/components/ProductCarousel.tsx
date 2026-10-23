"use client";

import { useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/data/products";

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
      className="grid h-9 w-9 place-items-center rounded-full border border-neutral-900/80 bg-white text-neutral-900 shadow-sm transition-all hover:bg-neutral-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {direction === "left" ? (
          <path d="M19 12H5M11 6l-6 6 6 6" />
        ) : (
          <path d="M5 12h14M13 6l6 6-6 6" />
        )}
      </svg>
    </button>
  );
}

interface ProductCarouselProps {
  products: Product[];
  onAdd?: (product: Product, quantity: number) => void;
  titleId?: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function ProductCarousel({
  products,
  onAdd,
  titleId,
  autoPlay = true,
  interval = 2800,
}: ProductCarouselProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  const scrollByPage = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlay || products.length < 2) return;

    const id = setInterval(() => {
      const el = scroller.current;
      if (!el || paused.current || el.children.length < 2) return;

      const pitch =
        (el.children[1] as HTMLElement).offsetLeft -
        (el.children[0] as HTMLElement).offsetLeft;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;

      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: pitch, behavior: "smooth" });
    }, interval);

    return () => clearInterval(id);
  }, [autoPlay, interval, products.length]);

  if (products.length === 0) return null;

  return (
    <div
      className="relative"
      aria-labelledby={titleId}
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
      <div className="mb-5 flex justify-end gap-2 sm:mb-6">
        <ArrowButton direction="left" onClick={() => scrollByPage(-1)} />
        <ArrowButton direction="right" onClick={() => scrollByPage(1)} />
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-[min(215px,72vw)] shrink-0 snap-start sm:w-[220px]"
          >
            <ProductCard
              name={product.name}
              image={product.image}
              price={product.price}
              href={product.href}
              badge={product.badge}
              category={product.category}
              subtitle={product.subtitle}
              originalPrice={product.originalPrice}
              discountPercent={product.discountPercent}
              priority={index < 2}
              isWishlisted={has(product.id) || has(product.slug)}
              onWishlistToggle={() => {
                void toggle(product);
              }}
              onAdd={(quantity) => {
                if (onAdd) {
                  onAdd(product, quantity);
                  toast("Added to cart", "success");
                  return;
                }
                addItem(
                  {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    href: product.href,
                    color: product.colors?.[0],
                  },
                  quantity
                );
                toast("Added to cart", "success");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
