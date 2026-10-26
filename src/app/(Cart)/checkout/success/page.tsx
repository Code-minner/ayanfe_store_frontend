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
import { formatNaira } from "@/lib/format";

type PendingPaystack = {
  orderId: string;
  email: string;
  invoiceNumber?: string;
  items: { name: string; image: string; price: number; quantity: number }[];
  subtotal: number;
  fee: number;
  total: number;
  shippingMethod?: string;
  shippingFee?: number;
};

type OrderSummary = {
  orderId: string;
  invoice: string;
  email: string;
  total: number;
  subtotal: number;
  fee: number;
  items: { name: string; quantity: number; price: number }[];
  status: string;
};

function readStoredSuccess(): OrderSummary | null {
  try {
    const raw = sessionStorage.getItem("ayanfe-checkout-success");
    if (!raw) return null;
    return JSON.parse(raw) as OrderSummary;
  } catch {
    return null;
  }
}

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
  const [paid, setPaid] = useState(!isPaystack);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [ready, setReady] = useState(false);

  // Load confirmation payload after mount so Strict Mode remounts do not wipe it.
  useEffect(() => {
    const stored = readStoredSuccess();
    if (stored) {
      setSummary(stored);
      try {
        sessionStorage.removeItem("ayanfe-checkout-success");
      } catch {
        /* ignore */
      }
    } else if (invoiceParam || emailParam) {
      setSummary({
        orderId: invoiceParam || "",
        invoice: invoiceParam || "",
        email: emailParam || "",
        total: 0,
        subtotal: 0,
        fee: 0,
        items: [],
        status: isBank ? "pending_verification" : "paid",
      });
    }
    setReady(true);
  }, [invoiceParam, emailParam, isBank]);

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
        const items = order.items?.length ? order.items : pending?.items || [];

        addLocalOrder({
          id: orderId,
          invoiceNumber: inv || undefined,
          date: order.createdAt || new Date().toISOString(),
          status: mapApiStatus(order.status),
          paymentMethod: "Paystack",
          paymentStatus: mapPaymentStatus(order.status),
          items,
          subtotal: order.subtotal ?? pending?.subtotal ?? 0,
          fee: order.fee ?? pending?.fee ?? 0,
          total: order.total ?? pending?.total ?? 0,
          email: orderEmail,
          shippingMethod: order.shipping?.method || pending?.shippingMethod,
          shippingFee: order.shipping?.shippingFee ?? pending?.shippingFee ?? 0,
        });

        sessionStorage.removeItem("ayanfe-paystack-pending");
        clearCheckoutDraft();
        clearCart();

        setSummary({
          orderId,
          invoice: inv,
          email: orderEmail,
          total: order.total ?? pending?.total ?? 0,
          subtotal: order.subtotal ?? pending?.subtotal ?? 0,
          fee: order.fee ?? pending?.fee ?? 0,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          status: order.status,
        });

        setPaid(paystack.status === "success" || order.status === "paid");
        if (paystack.status !== "success" && order.status !== "paid") {
          setVerifyError("Payment was not completed. You can try again from checkout.");
        }
      } catch (err) {
        if (cancelled) return;
        setVerifyError(
          err instanceof Error
            ? err.message
            : "Could not verify payment. Contact support if you were charged."
        );
        setPaid(false);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaystack, reference]);

  useEffect(() => {
    if (!isBank || !ready) return;
    clearCheckoutDraft();
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBank, ready]);

  if (!ready || verifying) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-neutral-600">
          {verifying ? "Confirming your payment..." : "Loading your confirmation..."}
        </p>
      </div>
    );
  }

  const failed = isPaystack && !paid;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div className="text-center">
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
        <h1 className="mt-5 text-3xl font-bold tracking-wide text-neutral-900">
          {failed ? "Payment not completed" : "Congratulations!"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {verifyError
            ? verifyError
            : isBank
              ? "Your order is in. We have your payment proof and will confirm once the transfer is verified."
              : "Your transaction is complete. Keep your order ID for tracking and support."}
        </p>
      </div>

      {summary && !failed ? (
        <div className="mt-6 space-y-4 rounded-xl bg-[#FAFAFA] px-4 py-4 text-sm">
          <dl className="space-y-2">
            {(summary.invoice || summary.orderId) && (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Order ID</dt>
                <dd className="font-semibold tracking-wider text-neutral-900">
                  {summary.invoice || summary.orderId}
                </dd>
              </div>
            )}
            {summary.email ? (
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Email</dt>
                <dd className="font-medium text-neutral-900">{summary.email}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-medium capitalize text-neutral-900">
                {isBank ? "Awaiting confirmation" : summary.status.replace(/_/g, " ")}
              </dd>
            </div>
            {summary.total > 0 ? (
              <div className="flex justify-between gap-3 border-t border-neutral-200 pt-2">
                <dt className="text-neutral-500">Total paid</dt>
                <dd className="font-semibold text-[#4B0A6B]">{formatNaira(summary.total)}</dd>
              </div>
            ) : null}
          </dl>

          {summary.items.length > 0 ? (
            <ul className="space-y-2 border-t border-neutral-200 pt-3">
              {summary.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3 text-neutral-700">
                  <span className="min-w-0 truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {failed ? (
          <Link
            href="/checkout"
            className="inline-flex justify-center rounded-full bg-[#4B0A6B] px-6 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </Link>
        ) : (
          <>
            <Link
              href="/orders"
              className="inline-flex justify-center rounded-full bg-[#4B0A6B] px-6 py-2.5 text-sm font-medium text-white"
            >
              View my orders
            </Link>
            <Link
              href="/shop"
              className="inline-flex justify-center rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-800"
            >
              Continue shopping
            </Link>
          </>
        )}
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
