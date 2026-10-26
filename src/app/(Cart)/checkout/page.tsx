"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutSummary from "@/components/cart/CheckoutSummary";
import ShippingMethodPicker from "@/components/cart/ShippingMethodPicker";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import type { PaymentMethod } from "@/data/payment";
import { NIGERIA_STATES, getShippingMethod } from "@/data/shipping";
import { fetchPaymentConfig } from "@/lib/api";
import {
  loadCheckoutDraft,
  saveCheckoutDraft,
  type CheckoutDraft,
} from "@/lib/checkoutDraft";

const ALL_METHODS: {
  id: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    id: "paystack",
    title: "Paystack",
    description: "Pay securely with card, bank, or USSD via Paystack.",
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer directly to our bank, then upload your receipt for confirmation.",
  },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#4B0A6B]";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    total,
    shippingMethod,
    shippingFee,
    setShippingMethod,
  } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [enabled, setEnabled] = useState<PaymentMethod[]>(["bank_transfer"]);
  const [draft, setDraft] = useState<CheckoutDraft>(() => loadCheckoutDraft());
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    setDraft((prev) => ({ ...prev, shippingMethod }));
  }, [shippingMethod]);

  useEffect(() => {
    if (!user) return;
    setDraft((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      firstName: prev.firstName || user.firstName || "",
      lastName: prev.lastName || user.lastName || "",
    }));
  }, [user]);

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
  const ship = getShippingMethod(shippingMethod);

  const patch = <K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handlePay = () => {
    if (items.length === 0) return;

    if (!draft.email.trim() || !draft.email.includes("@")) {
      setError("Enter a valid email so we can confirm your order.");
      return;
    }
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      setError("Enter your first and last name.");
      return;
    }
    if (!draft.phone.trim()) {
      setError("Enter a phone number.");
      return;
    }
    if (shippingMethod === "waybill") {
      if (!draft.address.trim() || !draft.city.trim() || !draft.state.trim()) {
        setError("Enter your street address, city, and state for waybill delivery.");
        return;
      }
      if (!draft.customerNote.trim()) {
        setError("Add your waybill order numbers in the note section.");
        return;
      }
    }

    const nextDraft = { ...draft, shippingMethod };
    saveCheckoutDraft(nextDraft);
    setError("");

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
            <div className="space-y-6">
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
                <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                  Billing details
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  Signed-in details are filled in for you. You can still edit them.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-neutral-800">
                    First name <span className="text-red-600">*</span>
                    <input
                      value={draft.firstName}
                      onChange={(e) => patch("firstName", e.target.value)}
                      autoComplete="given-name"
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800">
                    Last name <span className="text-red-600">*</span>
                    <input
                      value={draft.lastName}
                      onChange={(e) => patch("lastName", e.target.value)}
                      autoComplete="family-name"
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800 sm:col-span-2">
                    Email address <span className="text-red-600">*</span>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => patch("email", e.target.value)}
                      autoComplete="email"
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800 sm:col-span-2">
                    Phone <span className="text-red-600">*</span>
                    <input
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => patch("phone", e.target.value)}
                      autoComplete="tel"
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800">
                    Country / Region
                    <input
                      value={draft.country}
                      onChange={(e) => patch("country", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800">
                    State {shippingMethod === "waybill" ? <span className="text-red-600">*</span> : null}
                    <select
                      value={draft.state}
                      onChange={(e) => patch("state", e.target.value)}
                      className={inputClass}
                    >
                      {NIGERIA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-neutral-800 sm:col-span-2">
                    Street address
                    {shippingMethod === "waybill" ? (
                      <span className="text-red-600"> *</span>
                    ) : null}
                    <input
                      value={draft.address}
                      onChange={(e) => patch("address", e.target.value)}
                      placeholder="House number and street name"
                      autoComplete="street-address"
                      className={inputClass}
                    />
                  </label>
                  <label className="block text-sm font-medium text-neutral-800 sm:col-span-2">
                    Town / City
                    {shippingMethod === "waybill" ? (
                      <span className="text-red-600"> *</span>
                    ) : null}
                    <input
                      value={draft.city}
                      onChange={(e) => patch("city", e.target.value)}
                      autoComplete="address-level2"
                      className={inputClass}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
                <ShippingMethodPicker
                  value={shippingMethod}
                  onChange={(id) => {
                    setShippingMethod(id);
                    patch("shippingMethod", id);
                  }}
                />
                <label className="mt-6 block text-sm font-medium text-neutral-800">
                  Order note
                  {shippingMethod === "waybill" ? (
                    <span className="text-red-600"> *</span>
                  ) : null}
                  <textarea
                    value={draft.customerNote}
                    onChange={(e) => patch("customerNote", e.target.value)}
                    rows={3}
                    placeholder={
                      shippingMethod === "waybill"
                        ? "Type all valid order numbers for waybill"
                        : "Optional notes for your order"
                    }
                    className={inputClass}
                  />
                </label>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
                <h2 className="text-xl font-semibold text-neutral-900">Payment method</h2>
                <ul className="mt-4 divide-y divide-neutral-100" role="radiogroup" aria-label="Payment method">
                  {methods.map((m) => {
                    const selected = method === m.id;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setMethod(m.id)}
                          className="flex w-full items-start gap-4 py-4 text-left transition-colors hover:bg-neutral-50/80"
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

                {error && (
                  <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}
              </section>
            </div>

            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              shippingLabel={ship.title}
              total={total}
              onPay={handlePay}
              payLabel={
                method === "bank_transfer" ? "Continue to bank transfer" : "Pay with Paystack"
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
