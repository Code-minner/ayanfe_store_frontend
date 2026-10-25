"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import ProductSkeleton from "@/components/ProductSkeleton";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  productRequiresOptions,
  productSizeLabels,
  type Product,
} from "@/data/products";
import { addProductFromCard } from "@/lib/addProductFromCard";
import { apiFetchProducts } from "@/lib/api";
import Link from "next/link";

export default function WishlistPage() {
  const router = useRouter();
  const { items, toggle, loading } = useWishlist();
  const { addItem } = useCart();
  const { isSignedIn, hydrated } = useAuth();
  const { toast } = useToast();
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    apiFetchProducts({ featured: true, limit: 4 })
      .then(setRelated)
      .catch(() => setRelated([]));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/wishlist")}`;
    }
  }, [hydrated, isSignedIn]);

  if (!hydrated || !isSignedIn) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 bg-white">
          <div className="container-page py-10 sm:py-12">
            <ProductSkeleton count={4} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <div className="container-page py-10 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

          <section className="mt-8">
            {loading && items.length === 0 ? (
              <ProductSkeleton count={4} />
            ) : items.length === 0 ? (
              <div className="animate-fade-up rounded-2xl border border-neutral-200 px-6 py-20 text-center">
                <h1 className="text-xl font-semibold text-neutral-900">Your wishlist is empty</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                  Tap the heart on products you love to save them here.
                </p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex rounded-full bg-[#4B0A6B] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {items.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
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
                      priority={index < 4}
                      isWishlisted
                      onWishlistToggle={() => {
                        void toggle(product);
                      }}
                      requiresOptions={productRequiresOptions(product)}
                      optionsHint={
                        productSizeLabels(product).length
                          ? `Sizes: ${productSizeLabels(product).slice(0, 6).join(", ")}`
                          : undefined
                      }
                      onAdd={(quantity) => {
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
                ))}
              </div>
            )}
          </section>

          <section className="mt-14 sm:mt-16" aria-labelledby="related-wishlist">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="related-wishlist"
                className="section-heading text-neutral-900"
                style={{ fontFamily: "var(--font-anton), Anton, Impact, sans-serif" }}
              >
                RELATED PRODUCTS
              </h2>
              <Link
                href="/shop"
                className="inline-flex shrink-0 items-center rounded-full border border-[#4B0A6B] px-5 py-2 text-sm font-medium text-[#4B0A6B]"
              >
                View all
              </Link>
            </div>
            <div className="mt-6">
              <ProductGrid products={related} />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
