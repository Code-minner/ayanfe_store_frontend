"use client";

import { useState } from "react";
import Image from "next/image";
import type { StoredOrder } from "@/data/orders";
import { statusBadgeClass, statusLabel } from "@/data/orders";
import { getShippingMethod, type ShippingMethodId } from "@/data/shipping";
import { useAuth } from "@/context/AuthContext";
import { apiOpenMyInvoice } from "@/lib/api";
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

type Props = {
  order: StoredOrder | null;
  open: boolean;
  onClose: () => void;
};

export default function OrderModals({ order, open, onClose }: Props) {
  const { token } = useAuth();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  if (!order || !open) return null;

  const openInvoice = async () => {
    if (!token) {
      setError("Sign in again to view your invoice.");
      return;
    }
    setOpening(true);
    setError("");
    try {
      await apiOpenMyInvoice(token, order.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open invoice");
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
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
            disabled={opening}
            onClick={() => void openInvoice()}
            className="rounded-lg bg-[#4B0A6B] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:text-sm"
          >
            {opening ? "Opening..." : "View Invoice"}
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
          disabled={opening}
          onClick={() => void openInvoice()}
          className="mt-6 w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {opening ? "Opening invoice..." : "View / Download Invoice"}
        </button>
      </div>
    </div>
  );
}
