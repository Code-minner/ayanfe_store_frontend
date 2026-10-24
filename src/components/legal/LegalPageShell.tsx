import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function LegalPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
          <article className="mx-auto mt-6 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
            <h1 className="text-2xl font-semibold text-[#4B0A6B] sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>}
            <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
              {children}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
