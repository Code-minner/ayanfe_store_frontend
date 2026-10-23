"use client";

import Image from "next/image";
import type { StoredOrder } from "@/data/orders";
import { statusBadgeClass, statusLabel } from "@/data/orders";
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

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Props = {
  order: StoredOrder | null;
  mode: "details" | "invoice" | null;
  onClose: () => void;
  onOpenInvoice: () => void;
};

export default function OrderModals({ order, mode, onClose, onOpenInvoice }: Props) {
  if (!order || !mode) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={mode === "invoice" ? onClose : onClose}
            aria-label="Back"
            className="text-neutral-700 hover:text-[#4B0A6B]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-900">
            {mode === "invoice" ? "Invoice" : "Order Details"}
          </h2>
          {mode === "details" ? (
            <button
              type="button"
              onClick={onOpenInvoice}
              className="rounded-lg bg-[#4B0A6B] px-3 py-2 text-xs font-semibold text-white sm:text-sm"
            >
              Download Invoice
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {mode === "details" && (
          <>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-500">
                  Order ID{" "}
                  <span className="font-semibold text-neutral-900">
                    #{order.invoiceNumber || order.id.slice(0, 8)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Date{" "}
                  <span className="font-medium text-neutral-800">{formatDate(order.date)}</span>
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
                  <p className="mt-0.5 font-medium text-neutral-900">{order.paymentMethod}</p>
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
            <ProductTable order={order} />
          </>
        )}

        {mode === "invoice" && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-neutral-900">Order Summary</h3>
            <ProductTable order={order} showGrandTotal />

            <h3 className="mt-6 text-sm font-semibold text-neutral-900">Invoice Details</h3>
            <dl className="mt-3 space-y-3 rounded-xl border border-neutral-200 p-4 text-sm">
              <Row label="Order ID" value={`#${order.invoiceNumber || order.id.slice(0, 8)}`} />
              <Row label="Payment Method" value={order.paymentMethod} />
              <Row label="Date Purchase" value={formatDateTime(order.date)} />
              <Row label="Date Received" value={formatDateTime(order.receivedAt)} />
            </dl>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-bold text-white"
            >
              Download Invoice ( PDF )
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function ProductTable({
  order,
  showGrandTotal,
}: {
  order: StoredOrder;
  showGrandTotal?: boolean;
}) {
  return (
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
                  <span className="font-medium text-neutral-900">{item.name}</span>
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
          {showGrandTotal && (
            <tr className="border-t border-neutral-100">
              <td colSpan={2} className="px-3 py-3 font-semibold text-neutral-900">
                Total
              </td>
              <td className="px-3 py-3 text-right font-semibold text-neutral-900">
                {formatNaira(order.total)}
              </td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
}
