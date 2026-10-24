import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import CategoryHero from "@/components/CategoryHero";
import CategoryProductList from "@/components/CategoryProductList";
import ProductSkeleton from "@/components/ProductSkeleton";
import { CATEGORIES, getCategory } from "@/data/categories";
import { apiFetchProductsPage } from "@/lib/api";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category | Attog Store" };

  return {
    title: `${category.name} | Attog Store`,
    description: category.description,
  };
}

function CategoryPageFallback() {
  return (
    <>
      <div className="min-h-[320px] animate-pulse bg-neutral-200 sm:min-h-[400px] lg:min-h-[440px]" />
      <section className="bg-white pb-14 pt-8 sm:pb-16 sm:pt-10">
        <div className="container-page">
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8">
            <ProductSkeleton count={8} />
          </div>
        </div>
      </section>
    </>
  );
}

async function CategoryPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  let initialProducts: Awaited<ReturnType<typeof apiFetchProductsPage>>["products"] = [];
  let initialTotal = 0;
  let initialTotalPages = 1;

  try {
    const page = await apiFetchProductsPage({ category: slug, page: 1, limit: 24 });
    initialProducts = page.products;
    initialTotal = page.total;
    initialTotalPages = page.totalPages;
  } catch {
    initialProducts = [];
  }

  return (
    <>
      <CategoryHero {...category} />

      <section
        id="products"
        className="scroll-mt-28 bg-white pb-14 pt-8 sm:scroll-mt-32 sm:pb-16 sm:pt-10"
        aria-labelledby="category-products-title"
      >
        <div className="container-page">
          <h2 id="category-products-title" className="sr-only">
            {category.name} products
          </h2>

          <CategoryProductList
            categorySlug={slug}
            categoryName={category.name}
            initialProducts={initialProducts}
            initialTotal={initialTotal}
            initialTotalPages={initialTotalPages}
          />
        </div>
      </section>
    </>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <Suspense fallback={<CategoryPageFallback />}>
          <CategoryPageContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
