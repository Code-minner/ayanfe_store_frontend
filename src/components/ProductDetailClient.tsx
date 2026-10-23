"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const gallery = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const [color, setColor] = useState(product.colors?.[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const hasDiscount =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const percent =
    product.discountPercent ??
    (hasDiscount && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : undefined);

  const handleAdd = () => {
    addItem(
      {
        id: color ? `${product.id}-${color}` : product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        color,
        href: product.href ?? `/product/${product.slug}`,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

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
          <p className="text-xl font-semibold text-neutral-900">{formatNaira(product.price)}</p>
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
              {(product.stock ?? 0) > 0 ? `In stock (${product.stock})` : "Out of stock"}
            </dd>
          </div>
        </dl>

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
          <p className="text-sm font-medium text-neutral-800">Quantity</p>
          <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1.5">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-800 hover:bg-neutral-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAdd}
            disabled={(product.stock ?? 0) <= 0}
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
