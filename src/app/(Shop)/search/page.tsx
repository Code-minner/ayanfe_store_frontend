import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Search | Attog Store",
  description: "Search products at Attog Store.",
};

function SearchFallback() {
  return (
    <div className="container-page py-16 text-center text-sm text-neutral-500">
      Loading search…
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <Suspense fallback={<SearchFallback />}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
