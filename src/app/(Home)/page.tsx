import { Suspense } from "react";
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
  let featured: Awaited<ReturnType<typeof apiFetchProductsPage>>["products"] = [];
  let featuredTotal = 0;
  let featuredTotalPages = 1;
  let arrivals: Awaited<ReturnType<typeof apiFetchProducts>> = [];

  try {
    const [f, n] = await Promise.all([
      apiFetchProductsPage({ page: 1, limit: FEATURED_PAGE_SIZE }),
      apiFetchProducts({ newer: true, limit: 8, page: 1 }),
    ]);
    featured = f.products;
    featuredTotal = f.total;
    featuredTotalPages = f.totalPages;
    arrivals = n.map((p) => ({
      ...p,
      badge: p.badge ?? "New arrival",
    }));
  } catch {
    // API down at build/request time: show empty catalog shells
  }

  return (
    <>
      <NewArrivals products={arrivals} backgroundImage="/assets/hero8.png" />
      <FeaturedProducts
        products={featured}
        initialTotal={featuredTotal}
        initialTotalPages={featuredTotalPages}
        pageSize={FEATURED_PAGE_SIZE}
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
