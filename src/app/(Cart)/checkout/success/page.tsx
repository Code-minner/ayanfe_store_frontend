"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { addLocalOrder, mapApiStatus, mapPaymentStatus } from "@/data/orders";
import { verifyPaystack } from "@/lib/api";
import { clearCheckoutDraft } from "@/lib/checkoutDraft";

type PendingPaystack = {
  orderId: string;
  email: string;
  invoiceNumber?: string;
  items: { name: string; image: string; price: number; quantity: number }[];
  subtotal: number;
  fee: number;
  total: number;
};

function SuccessBody() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const method = params.get("method");
  const reference = params.get("reference") || params.get("trxref");
  const invoiceParam = params.get("invoice");
  const emailParam = params.get("email");
  const isBank = method === "bank_transfer";
  const isPaystack = method === "paystack" || Boolean(reference);

  const [verifying, setVerifying] = useState(isPaystack && Boolean(reference));
  const [verifyError, setVerifyError] = useState("");
  const [invoice, setInvoice] = useState(invoiceParam || "");
  const [email, setEmail] = useState(emailParam || "");
  const [paid, setPaid] = useState(!isPaystack);

  useEffect(() => {
    if (!isPaystack || !reference) return;

    let cancelled = false;

    (async () => {
      try {
        const { order, paystack } = await verifyPaystack(reference);
        if (cancelled) return;

        const pendingRaw = sessionStorage.getItem("ayanfe-paystack-pending");
        let pending: PendingPaystack | null = null;
        try {
          pending = pendingRaw ? (JSON.parse(pendingRaw) as PendingPaystack) : null;
        } catch {
          pending = null;
        }

        const orderId = order.id || order._id || pending?.orderId || "";
        const inv = order.invoiceNumber || pending?.invoiceNumber || orderId;
        const orderEmail = order.email || pending?.email || "";

        addLocalOrder({
          id: orderId,
          invoiceNumber: inv || undefined,
          date: order.createdAt || new Date().toISOString(),
          status: mapApiStatus(order.status),
          paymentMethod: "Paystack",
          paymentStatus: mapPaymentStatus(order.status),
          items: order.items?.length
            ? order.items
            : pending?.items || [],
          subtotal: order.subtotal ?? pending?.subtotal ?? 0,
          fee: order.fee ?? pending?.fee ?? 0,
          total: order.total ?? pending?.total ?? 0,
          email: orderEmail,
        });

        sessionStorage.removeItem("ayanfe-paystack-pending");
        clearCheckoutDraft();
        clearCart();

        setInvoice(inv);
        setEmail(orderEmail);
        setPaid(paystack.status === "success" || order.status === "paid");
        if (paystack.status !== "success" && order.status !== "paid") {
          setVerifyError("Payment was not completed. You can try again from checkout.");
        }
      } catch (err) {
        if (cancelled) return;
        setVerifyError(
          err instanceof Error ? err.message : "Could not verify payment. Contact support if you were charged."
        );
        setPaid(false);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // clearCart is stable enough for this one-shot verify; omit from deps to avoid re-verify loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaystack, reference]);

  if (verifying) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-neutral-600">Confirming your payment...</p>
      </div>
    );
  }

  const failed = isPaystack && !paid;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div
        className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
          failed ? "bg-red-50 text-red-600" : "bg-[#F3E6F6] text-[#4B0A6B]"
        }`}
      >
        {failed ? (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-neutral-900">
        {failed
          ? "Payment not completed"
          : isBank
            ? "Order received - awaiting confirmation"
            : "Thank you"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {verifyError
          ? verifyError
          : isBank
            ? "We've got your payment proof. Our team will verify the transfer and confirm your order. You'll get an email once it's approved."
            : "Your payment was successful. We'll email your order details shortly."}
      </p>

      {(invoice || email) && !failed && (
        <dl className="mt-6 space-y-2 rounded-xl bg-[#FAFAFA] px-4 py-4 text-left text-sm">
          {invoice && (
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Invoice / order</dt>
              <dd className="font-medium text-neutral-900">{invoice}</dd>
            </div>
          )}
          {email && (
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Confirmation email</dt>
              <dd className="font-medium text-neutral-900">{email}</dd>
            </div>
          )}
          {isBank && (
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-medium text-amber-700">Pending verification</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {failed ? (
          <Link
            href="/checkout"
            className="inline-flex justify-center rounded-full bg-[#4B0A6B] px-6 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </Link>
        ) : (
          <Link
            href="/shop"
            className="inline-flex justify-center rounded-full bg-[#4B0A6B] px-6 py-2.5 text-sm font-medium text-white"
          >
            Continue shopping
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex justify-center rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center bg-[#FAFAFA] py-16">
        <div className="container-page">
          <Suspense fallback={<p className="text-center text-sm text-neutral-500">Loading...</p>}>
            <SuccessBody />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
