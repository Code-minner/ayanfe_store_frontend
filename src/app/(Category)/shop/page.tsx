import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import CategoryHero from "@/components/CategoryHero";
import { CATEGORIES, SHOP_ALL, categoryHref } from "@/data/categories";

export const metadata: Metadata = {
  title: "Shop All | Attog Store",
  description:
    "Browse every category at Attog Store — footwear, fashion, home, gadgets and more.",
};

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <CategoryHero {...SHOP_ALL} />

        <section
          id="products"
          className="section-y scroll-mt-28 sm:scroll-mt-32"
          aria-labelledby="shop-categories-title"
        >
          <div className="container-page">
            <h2 id="shop-categories-title" className="section-heading text-[#6B0080]">
              All categories
            </h2>
            <p className="mt-3 max-w-xl text-sm text-neutral-600">
              Explore every category, from footwear and fashion to home, gadgets and everyday
              essentials.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={categoryHref(cat.slug)}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4B0A6B]/35 hover:shadow-[0_16px_40px_rgba(75,10,107,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B]"
                  >
                    <span className="relative aspect-[4/3] w-full bg-[#FAF7FB]">
                      <Image
                        src={cat.heroImage}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-1 flex-col gap-1.5 p-4">
                      <span className="text-sm font-semibold text-neutral-900 group-hover:text-[#4B0A6B]">
                        {cat.name}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
                        {cat.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
