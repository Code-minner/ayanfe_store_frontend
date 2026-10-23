"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatNaira } from "@/lib/format";
import { createPaystackOrder, initializePaystack } from "@/lib/api";

export default function PaystackCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, subtotal, fee } = useCart();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev || user.email || "");
    setPhone((prev) => prev || user.phone || "");
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    if (name) setFullName((prev) => prev || name);
  }, [user]);

  const handlePay = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email so we can confirm your order.");
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    setError("");
    try {
      const { order } = await createPaystackOrder({
        email: email.trim(),
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          color: i.color,
        })),
        shipping: {
          fullName: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      });

      const orderId = order.id || order._id;
      if (!orderId) throw new Error("Order was created without an id");

      // Keep cart items until verify succeeds so a cancelled payment can retry.
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
          })),
          subtotal,
          fee,
          total: order.total ?? total,
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
            <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
              Pay with card or bank
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              You&apos;ll be redirected to Paystack to complete payment securely.
            </p>

            <div className="mt-5 rounded-xl bg-[#FAFAFA] px-4 py-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-500">Amount due</span>
                <span className="font-semibold text-neutral-900">{formatNaira(total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-neutral-800">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#4B0A6B]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-800">Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#4B0A6B]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-800">Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#4B0A6B]"
                />
              </label>
            </div>

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
