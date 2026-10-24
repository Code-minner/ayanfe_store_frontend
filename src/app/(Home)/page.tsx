import { Suspense } from "react";
import { connection } from "next/server";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import NewArrivals from "./components/NewArrivals";
import FeaturedProducts from "./components/FeaturedProducts";
import ShoppingSimple from "./components/ShoppingSimple";
import Newsletter from "./components/NewsLetter";
import ProductSkeleton from "@/components/ProductSkeleton";
import { apiFetchProducts, apiFetchProductsPage } from "@/lib/api";

const FEATURED_PAGE_SIZE = 16;

function CatalogFallback() {
  return (
    <>
      <section className="section-y bg-[#FAFAFA]">
        <div className="container-page">
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8">
            <ProductSkeleton count={4} />
          </div>
        </div>
      </section>
      <section className="section-y">
        <div className="container-page">
          <div className="h-8 w-56 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8">
            <ProductSkeleton count={8} />
          </div>
        </div>
      </section>
    </>
  );
}

async function HomeCatalog() {
  // Request-time fetch so Vercel build does not bake an empty catalog
  // when the API is unreachable at build.
  await connection();

  let catalog: Awaited<ReturnType<typeof apiFetchProductsPage>>["products"] = [];
  let catalogTotal = 0;
  let catalogTotalPages = 1;
  let arrivals: Awaited<ReturnType<typeof apiFetchProducts>> = [];
  let loadError = "";

  try {
    const [all, newer] = await Promise.all([
      apiFetchProductsPage({ page: 1, limit: FEATURED_PAGE_SIZE }),
      apiFetchProducts({ newer: true, limit: 8, page: 1 }),
    ]);

    catalog = all.products;
    catalogTotal = all.total;
    catalogTotalPages = all.totalPages;

    arrivals =
      newer.length > 0
        ? newer.map((p) => ({ ...p, badge: p.badge ?? "New arrival" }))
        : all.products.slice(0, 8).map((p) => ({
            ...p,
            badge: p.badge ?? "New arrival",
          }));
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load products";
  }

  return (
    <>
      <NewArrivals products={arrivals} backgroundImage="/assets/hero8.png" />
      <FeaturedProducts
        products={catalog}
        initialTotal={catalogTotal}
        initialTotalPages={catalogTotalPages}
        pageSize={FEATURED_PAGE_SIZE}
        loadError={loadError}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Categories />
        <Suspense fallback={<CatalogFallback />}>
          <HomeCatalog />
        </Suspense>
        <ShoppingSimple />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
