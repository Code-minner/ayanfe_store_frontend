"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutSummary from "@/components/cart/CheckoutSummary";
import { useCart } from "@/context/CartContext";
import type { PaymentMethod } from "@/data/payment";
import { fetchPaymentConfig } from "@/lib/api";

const ALL_METHODS: {
  id: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    id: "paystack",
    title: "Pay with Card or Bank",
    description: "Effortlessly Complete Transactions Using Your Bank Account.",
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer directly to our bank, then upload your receipt for confirmation.",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, total } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [enabled, setEnabled] = useState<PaymentMethod[]>(["bank_transfer"]);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    fetchPaymentConfig()
      .then((cfg) => {
        const next: PaymentMethod[] = [];
        if (cfg.payments.bankTransfer) next.push("bank_transfer");
        if (cfg.payments.paystack) next.push("paystack");
        setEnabled(next.length ? next : ["bank_transfer"]);
        if (!next.includes(method) && next[0]) setMethod(next[0]);
      })
      .catch(() => setEnabled(["bank_transfer"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  const methods = ALL_METHODS.filter((m) => enabled.includes(m.id));

  const handlePay = async () => {
    if (items.length === 0) return;

    if (method === "bank_transfer") {
      router.push("/checkout/bank-transfer");
      return;
    }

    router.push("/checkout/paystack");
  };

  if (items.length === 0) return null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout" },
            ]}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
              <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                Payment Method
              </h1>

              <ul className="mt-6 divide-y divide-neutral-100" role="radiogroup" aria-label="Payment method">
                {methods.map((m) => {
                  const selected = method === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setMethod(m.id)}
                        className="flex w-full items-start gap-4 py-5 text-left transition-colors hover:bg-neutral-50/80"
                      >
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                            selected ? "border-[#4B0A6B]" : "border-neutral-300"
                          }`}
                          aria-hidden
                        >
                          {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#4B0A6B]" />}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-neutral-900 sm:text-base">
                            {m.title}
                          </span>
                          <span className="mt-1 block text-xs text-neutral-500 sm:text-sm">
                            {m.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              total={total}
              onPay={handlePay}
              payLabel={
                method === "bank_transfer"
                  ? "Continue to bank transfer"
                  : "Continue to Paystack"
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
