"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import SupportModal from "@/components/SupportModal";
import { STORE_CONTACT, STORE_FAQS } from "@/data/contact";

export default function HelpPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help center" }]} />
          <h1 className="mt-4 text-3xl font-semibold text-[#4B0A6B]">Help center</h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-600">
            Find answers about orders, payments, and deliveries, or contact support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl bg-[#4B0A6B] px-5 py-3 text-sm font-semibold text-white"
            >
              Contact support
            </button>
            <Link
              href="/contact"
              className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900"
            >
              Full contact & FAQ
            </Link>
          </div>

          <section className="mt-10 max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Quick answers</h2>
            <ul className="mt-4 space-y-4">
              {STORE_FAQS.slice(0, 3).map((faq) => (
                <li key={faq.question}>
                  <p className="text-sm font-medium text-[#4B0A6B]">{faq.question}</p>
                  <p className="mt-1 text-sm text-neutral-600">{faq.answer}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/contact#faq"
              className="mt-5 inline-block text-sm font-medium text-[#4B0A6B] underline underline-offset-2"
            >
              See all FAQs
            </Link>
          </section>

          <p className="mt-6 text-sm text-neutral-500">
            Call{" "}
            <a href={`tel:${STORE_CONTACT.phoneTel}`} className="text-[#4B0A6B] underline-offset-2 hover:underline">
              {STORE_CONTACT.phoneDisplay}
            </a>{" "}
            or email{" "}
            <a
              href={`mailto:${STORE_CONTACT.emails[0]}`}
              className="text-[#4B0A6B] underline-offset-2 hover:underline"
            >
              {STORE_CONTACT.emails[0]}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
      <SupportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
