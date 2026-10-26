"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import { createPaystackOrder, initializePaystack } from "@/lib/api";
import {
  draftToShippingPayload,
  loadCheckoutDraft,
} from "@/lib/checkoutDraft";
import { getShippingMethod } from "@/data/shipping";

export default function PaystackCheckoutPage() {
  const router = useRouter();
  const { items, total, subtotal, fee, shippingMethod } = useCart();
  const [draft] = useState(() => loadCheckoutDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const ship = getShippingMethod(shippingMethod);
  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim();

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    if (!draft.email.trim()) router.replace("/checkout");
  }, [draft.email, router]);

  const handlePay = async () => {
    if (!draft.email.trim() || !draft.email.includes("@")) {
      setError("Missing checkout email. Go back and complete billing details.");
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    setError("");
    try {
      const { order } = await createPaystackOrder({
        email: draft.email.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          color: i.color,
          size: i.size || i.variantLabel,
          brand: i.brand,
        })),
        customerNote: draft.customerNote.trim() || undefined,
        shipping: draftToShippingPayload({ ...draft, shippingMethod }),
      });

      const orderId = order.id || order._id;
      if (!orderId) throw new Error("Order was created without an id");

      sessionStorage.setItem(
        "ayanfe-paystack-pending",
        JSON.stringify({
          orderId,
          email: order.email,
          invoiceNumber: order.invoiceNumber || "",
          items: items.map((i) => ({
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            color: i.color,
            size: i.size || i.variantLabel,
            brand: i.brand,
          })),
          subtotal,
          fee,
          total: order.total ?? total,
          shippingMethod,
          shippingFee: ship.fee,
        })
      );

      const callbackUrl = `${window.location.origin}/checkout/success?method=paystack`;
      const init = await initializePaystack(orderId, callbackUrl);
      window.location.href = init.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment. Please try again.");
      setSubmitting(false);
    }
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
              { label: "Checkout", href: "/checkout" },
              { label: "Paystack" },
            ]}
          />

          <div className="mt-6 mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <Link
              href="/checkout"
              className="text-sm font-medium text-[#4B0A6B] underline-offset-2 hover:underline"
            >
              Edit billing details
            </Link>
            <h1 className="mt-3 text-xl font-semibold text-neutral-900 sm:text-2xl">Paystack</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Confirm your details, then continue to Paystack to pay securely.
            </p>

            <dl className="mt-5 space-y-2 rounded-xl bg-[#FAFAFA] px-4 py-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Amount due</dt>
                <dd className="font-semibold text-neutral-900">{formatNaira(total)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Shipment</dt>
                <dd className="font-medium text-neutral-900">{ship.title}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Email</dt>
                <dd className="font-medium text-neutral-900">{draft.email}</dd>
              </div>
              {fullName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Name</dt>
                  <dd className="font-medium text-neutral-900">{fullName}</dd>
                </div>
              )}
              {draft.phone && (
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">Phone</dt>
                  <dd className="font-medium text-neutral-900">{draft.phone}</dd>
                </div>
              )}
            </dl>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-[#4B0A6B] px-6 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            >
              {submitting ? "Redirecting to Paystack..." : `Pay ${formatNaira(total)}`}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
