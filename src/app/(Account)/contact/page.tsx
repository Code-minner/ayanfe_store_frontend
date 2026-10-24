import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/contact/FaqAccordion";
import { STORE_CONTACT, STORE_FAQS } from "@/data/contact";

export const metadata: Metadata = {
  title: "Contact Us | Attog Store",
  description:
    "FAQs, store address, phone and email for Attog Store in Egbeda, Lagos.",
};

export default function ContactPage() {
  const { addressLines, emails, phoneDisplay, phoneTel, whatsapp } = STORE_CONTACT;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
          />

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <section
              id="faq"
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-7"
              aria-labelledby="faq-title"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4B0A6B]/80">
                Information questions
              </p>
              <h1
                id="faq-title"
                className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl"
              >
                Frequently asked questions
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Quick answers about products, orders, returns, and shipping.
              </p>
              <div className="mt-6">
                <FaqAccordion items={STORE_FAQS} />
              </div>
            </section>

            <section
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-7"
              aria-labelledby="contact-title"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4B0A6B]/80">
                Information about us
              </p>
              <h2
                id="contact-title"
                className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl"
              >
                Contact us for any questions
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Visit the store, call, or email. We are happy to help with orders
                and wholesale enquiries.
              </p>

              <dl className="mt-8 space-y-6 text-sm">
                <div>
                  <dt className="font-semibold text-neutral-900">Address</dt>
                  <dd className="mt-2 space-y-0.5 leading-relaxed text-neutral-600">
                    {addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-neutral-900">Email</dt>
                  <dd className="mt-2 space-y-1">
                    {emails.map((email) => (
                      <p key={email}>
                        <a
                          href={`mailto:${email}`}
                          className="text-[#4B0A6B] underline-offset-2 hover:underline"
                        >
                          {email}
                        </a>
                      </p>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-neutral-900">Phone</dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${phoneTel}`}
                      className="text-[#4B0A6B] underline-offset-2 hover:underline"
                    >
                      {phoneDisplay}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center rounded-full bg-[#4B0A6B] px-5 py-2.5 text-sm font-medium text-white"
                >
                  WhatsApp us
                </a>
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800"
                >
                  Call {phoneDisplay}
                </a>
              </div>

              <p className="mt-6 text-xs text-neutral-500">
                Looking for order help?{" "}
                <Link href="/orders" className="text-[#4B0A6B] underline-offset-2 hover:underline">
                  View your orders
                </Link>{" "}
                or open the{" "}
                <Link href="/help" className="text-[#4B0A6B] underline-offset-2 hover:underline">
                  help center
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
