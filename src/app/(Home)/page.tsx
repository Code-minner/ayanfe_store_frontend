import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import NewArrivals from "./components/NewArrivals";
import FeaturedProducts from "./components/FeaturedProducts";
import ShoppingSimple from "./components/ShoppingSimple";
import Newsletter from "./components/NewsLetter";
import { apiFetchProducts, apiFetchProductsPage } from "@/lib/api";

const FEATURED_PAGE_SIZE = 16;

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof apiFetchProductsPage>>["products"] = [];
  let featuredTotal = 0;
  let featuredTotalPages = 1;
  let arrivals: Awaited<ReturnType<typeof apiFetchProducts>> = [];

  try {
    const [f, n] = await Promise.all([
      // All active products (not only isFeatured), 16 per page
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
    // API down: render empty sections rather than mock catalog
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Categories />
        <NewArrivals products={arrivals} backgroundImage="/assets/hero8.png" />
        <FeaturedProducts
          products={featured}
          initialTotal={featuredTotal}
          initialTotalPages={featuredTotalPages}
          pageSize={FEATURED_PAGE_SIZE}
        />
        <ShoppingSimple />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
