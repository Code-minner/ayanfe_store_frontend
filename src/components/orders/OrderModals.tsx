"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StoredOrder } from "@/data/orders";
import { statusBadgeClass, statusLabel } from "@/data/orders";
import { getShippingMethod, type ShippingMethodId } from "@/data/shipping";
import { useAuth } from "@/context/AuthContext";
import { apiFetchMyInvoice } from "@/lib/api";
import { formatNaira } from "@/lib/format";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function deliveryLabel(order: StoredOrder) {
  const method = order.shippingMethod;
  if (!method) return "Not set";
  try {
    return getShippingMethod(method as ShippingMethodId).title;
  } catch {
    return method.replace(/_/g, " ");
  }
}

/** Hide the standalone print toolbar when embedding in the app modal. */
function embedInvoiceHtml(html: string) {
  return html
    .replace(/<div class="toolbar">[\s\S]*?<\/div>/i, "")
    .replace(
      "</head>",
      `<style>
        html, body { background: #fff !important; }
        .wrap { padding: 0 !important; }
        .sheet { box-shadow: none !important; border: 0 !important; margin: 0 auto !important; }
      </style></head>`
    );
}

type Props = {
  order: StoredOrder | null;
  open: boolean;
  onClose: () => void;
};

export default function OrderModals({ order, open, onClose }: Props) {
  const { token } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [view, setView] = useState<"details" | "invoice">("details");
  const [invoiceHtml, setInvoiceHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setView("details");
      setInvoiceHtml("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!order || !open) return null;

  const loadInvoice = async () => {
    if (!token) {
      setError("Sign in again to view your invoice.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const html = await apiFetchMyInvoice(token, order.id);
      setInvoiceHtml(embedInvoiceHtml(html));
      setView("invoice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open invoice");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  const downloadFile = () => {
    if (!invoiceHtml) return;
    const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.invoiceNumber || order.id}-invoice.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeAll = () => {
    setView("details");
    setInvoiceHtml("");
    onClose();
  };

  if (view === "invoice" && invoiceHtml) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-black/40"
          onClick={closeAll}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setView("details")}
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-[#4B0A6B]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <h2 className="text-base font-semibold text-neutral-900">Invoice</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadFile}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 sm:text-sm"
              >
                Download
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="rounded-lg bg-[#4B0A6B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3a0854] sm:text-sm"
              >
                Save PDF
              </button>
            </div>
          </div>
          <iframe
            ref={iframeRef}
            title="Invoice"
            srcDoc={invoiceHtml}
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={closeAll}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeAll}
            aria-label="Back"
            className="text-neutral-700 hover:text-[#4B0A6B]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-900">Order Details</h2>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadInvoice()}
            className="rounded-lg bg-[#4B0A6B] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:text-sm"
          >
            {loading ? "Loading..." : "View Invoice"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">
              Order ID{" "}
              <span className="font-semibold text-neutral-900">
                #{order.invoiceNumber || order.id.slice(0, 8)}
              </span>
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Date <span className="font-medium text-neutral-800">{formatDate(order.date)}</span>
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Delivery{" "}
              <span className="font-medium text-neutral-800">{deliveryLabel(order)}</span>
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
          >
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-neutral-500">Payment Method</p>
              <p className="mt-0.5 font-medium capitalize text-neutral-900">{order.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500">Total Paid</p>
              <p className="mt-0.5 font-semibold text-neutral-900">{formatNaira(order.total)}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                order.paymentStatus === "confirmed"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.paymentStatus === "failed"
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {order.paymentStatus === "confirmed"
                ? "Confirmed"
                : order.paymentStatus === "failed"
                  ? "Failed"
                  : "Pending"}
            </span>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-neutral-900">Products Ordered</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-3 py-3 font-medium">Product Name</th>
                <th className="px-3 py-3 font-medium">Qty</th>
                <th className="px-3 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={`${item.name}-${i}`} className="border-t border-neutral-100">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
                        <Image src={item.image} alt="" fill className="object-contain p-1" sizes="40px" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-neutral-900">{item.name}</span>
                        {[
                          item.brand ? `Brand: ${item.brand}` : null,
                          item.size
                            ? `${/^\d{2,3}$/.test(String(item.size).trim()) || /^age\s*\d+/i.test(String(item.size).trim()) || /^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(String(item.size).trim()) ? "Size" : "Option"}: ${item.size}`
                            : null,
                          item.color ? `Color: ${item.color}` : null,
                        ]
                          .filter(Boolean)
                          .map((line) => (
                            <span key={String(line)} className="mt-0.5 block text-xs text-neutral-500">
                              {line}
                            </span>
                          ))}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-neutral-700">{item.quantity}</td>
                  <td className="px-3 py-3 text-right font-medium text-neutral-900">
                    {formatNaira(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200">
                <td colSpan={2} className="px-3 py-3 font-medium text-neutral-700">
                  Subtotal
                </td>
                <td className="px-3 py-3 text-right font-medium text-neutral-900">
                  {formatNaira(order.subtotal)}
                </td>
              </tr>
              <tr className="border-t border-neutral-100">
                <td colSpan={2} className="px-3 py-3 font-medium text-neutral-700">
                  Delivery ({deliveryLabel(order)})
                </td>
                <td className="px-3 py-3 text-right font-medium text-neutral-900">
                  {(order.shippingFee ?? 0) > 0 ? formatNaira(order.shippingFee ?? 0) : "Free"}
                </td>
              </tr>
              <tr className="border-t border-neutral-100">
                <td colSpan={2} className="px-3 py-3 font-semibold text-neutral-900">
                  Total
                </td>
                <td className="px-3 py-3 text-right font-semibold text-neutral-900">
                  {formatNaira(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={loading}
          onClick={() => void loadInvoice()}
          className="mt-6 w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Loading invoice..." : "View Invoice"}
        </button>
      </div>
    </div>
  );
}
