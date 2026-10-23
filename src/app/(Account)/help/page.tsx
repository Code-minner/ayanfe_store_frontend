"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import SupportModal from "@/components/SupportModal";

export default function HelpPage() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help center" }]} />
          <h1 className="mt-4 text-3xl font-semibold text-[#4B0A6B]">Help center</h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-600">
            Find answers about orders, payments, and deliveries — or contact support.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 rounded-xl bg-[#4B0A6B] px-5 py-3 text-sm font-semibold text-white"
          >
            Contact support
          </button>
        </div>
      </main>
      <Footer />
      <SupportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
