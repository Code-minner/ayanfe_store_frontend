"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { BANK_TRANSFER, type BankTransferDetails } from "@/data/payment";
import { formatNaira } from "@/lib/format";
import { fetchPaymentConfig, submitBankTransferOrder } from "@/lib/api";
import { addLocalOrder, mapApiStatus } from "@/data/orders";
import {
  clearCheckoutDraft,
  draftToShippingPayload,
  loadCheckoutDraft,
} from "@/lib/checkoutDraft";
import { getShippingMethod } from "@/data/shipping";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="ml-2 inline-flex text-neutral-400 transition-colors hover:text-[#4B0A6B]"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export default function BankTransferPage() {
  const router = useRouter();
  const { items, total, subtotal, fee, shippingMethod, clearCart } = useCart();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draft] = useState(() => loadCheckoutDraft());
  const [bank, setBank] = useState<BankTransferDetails>(BANK_TRANSFER);
  const ship = getShippingMethod(shippingMethod);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  useEffect(() => {
    if (!draft.email.trim()) router.replace("/checkout");
  }, [draft.email, router]);

  useEffect(() => {
    fetchPaymentConfig()
      .then((cfg) => {
        setBank({
          bankName: cfg.bank.bankName,
          accountName: cfg.bank.accountName,
          accountNumber: cfg.bank.accountNumber,
        });
      })
      .catch(() => {
        /* keep local fallback */
      });
  }, []);

  const acceptFile = (next: File | null) => {
    setError("");
    if (!next) {
      setFile(null);
      return;
    }
    const okType = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(next.type);
    const okSize = next.size <= 3 * 1024 * 1024;
    if (!okType) {
      setError("Please upload a PNG or JPG file.");
      return;
    }
    if (!okSize) {
      setError("File must be 3MB or smaller.");
      return;
    }
    setFile(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handlePaid = async () => {
    if (!draft.email.trim() || !draft.email.includes("@")) {
      setError("Missing checkout email. Go back and complete billing details.");
      return;
    }
    if (!file) {
      setError("Please upload proof of payment.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { order } = await submitBankTransferOrder({
        email: draft.email.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          color: i.color,
        })),
        customerNote: draft.customerNote.trim() || undefined,
        shipping: draftToShippingPayload({ ...draft, shippingMethod }),
        receipt: file,
      });

      const invoice = order.invoiceNumber || order.id || order._id || "";
      addLocalOrder({
        id: order.id || order._id || invoice,
        invoiceNumber: order.invoiceNumber || invoice,
        date: new Date().toISOString(),
        status: mapApiStatus(order.status),
        paymentMethod: "Bank Transfer",
        paymentStatus: order.status === "paid" ? "confirmed" : "pending",
        items: items.map((i) => ({
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        fee,
        total: order.total ?? total,
        email: order.email,
      });
      clearCheckoutDraft();
      clearCart();
      router.push(
        `/checkout/success?method=bank_transfer&invoice=${encodeURIComponent(invoice)}&email=${encodeURIComponent(order.email)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim();
  const rows = [
    { label: "Amount", value: formatNaira(total), copy: String(total) },
    { label: "Payment Method", value: "Bank Transfer" },
    { label: "Shipment", value: ship.title },
    { label: "Email", value: draft.email },
    ...(fullName ? [{ label: "Name", value: fullName }] : []),
    { label: "Bank Name", value: bank.bankName },
    { label: "Account Name", value: bank.accountName },
    { label: "Account Number", value: bank.accountNumber, copy: bank.accountNumber },
  ];

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
            ]}
          />

          <div className="mx-auto mt-8 max-w-xl">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-7">
              <Link
                href="/checkout"
                aria-label="Back to checkout"
                className="inline-flex text-neutral-700 transition-colors hover:text-[#4B0A6B]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <h1 className="mt-4 text-xl font-semibold text-neutral-900 sm:text-2xl">
                Payment Details
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Transfer the amount below, upload your receipt, then submit for confirmation.
              </p>
              <div className="mt-4 border-t border-neutral-100" />

              <dl className="mt-5 space-y-4">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                    <dt className="text-neutral-500">{row.label}</dt>
                    <dd className="flex items-center text-right font-medium text-neutral-900">
                      {row.value}
                      {row.copy && <CopyButton value={row.copy} label={row.label} />}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <p className="text-sm font-medium text-neutral-800">Upload proof of payment</p>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`mt-3 flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition-colors ${
                    dragging
                      ? "border-[#4B0A6B] bg-[#F3E6F6]/50"
                      : "border-neutral-300 bg-neutral-50 hover:border-[#4B0A6B]/50"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M12 16V7m0 0l-3.5 3.5M12 7l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 16.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5" strokeLinecap="round" />
                  </svg>
                  <p className="mt-3 text-sm text-neutral-700">
                    <span className="font-semibold text-[#4B0A6B]">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">PNG, JPG (max. 3mb)</p>
                  {file && (
                    <p className="mt-3 text-xs font-medium text-[#4B0A6B]">{file.name}</p>
                  )}
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
                />

                {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              </div>

              <button
                type="button"
                onClick={handlePaid}
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#4B0A6B] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#3a0854] disabled:opacity-60"
              >
                {submitting ? "Submitting for confirmation..." : "Submit for confirmation"}
              </button>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
