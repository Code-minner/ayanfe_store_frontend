import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCarousel from "@/components/ProductCarousel";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getRelatedProducts } from "@/data/products";
import { categoryHref } from "@/data/categories";
import { apiFetchProductBySlug, apiFetchProducts } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await apiFetchProductBySlug(slug);
    if (!product) return { title: "Product | Attog Store" };
    return {
      title: `${product.name} | Attog Store`,
      description: product.description,
    };
  } catch {
    return { title: "Product | Attog Store" };
  }
}

function ProductPageFallback() {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="h-4 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-24 w-full animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

async function ProductPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await apiFetchProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  let related: Awaited<ReturnType<typeof apiFetchProducts>> = [];
  try {
    const siblings = await apiFetchProducts({
      category: product.categorySlug,
      limit: 12,
      page: 1,
    });
    related = getRelatedProducts(siblings, product, 12);
  } catch {
    related = [];
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(product.categorySlug
            ? [
                {
                  label: product.category ?? "Shop",
                  href: categoryHref(product.categorySlug),
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <ProductDetailClient product={product} />

      {related.length > 0 && (
        <section className="mt-14 sm:mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-semibold text-neutral-900 sm:text-2xl">
            You may also like
          </h2>
          <div className="mt-6">
            <ProductCarousel products={related} titleId="related-title" />
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <Suspense fallback={<ProductPageFallback />}>
          <ProductPageContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
