"use client";

import Image from "next/image";
import type { StoredOrder } from "@/data/orders";
import { statusBadgeClass, statusLabel } from "@/data/orders";
import { getShippingMethod, type ShippingMethodId } from "@/data/shipping";
import BrandLogo from "@/components/BrandLogo";
import { formatNaira } from "@/lib/format";
import { printOrderInvoice } from "@/lib/printInvoice";

const STORE_LEGAL_NAME = "Ayanfe T.T.O Gracious";
const STORE_ADDRESS =
  "4b Fadipe street, (by Phidel Group of Schools, Seliat branch) 3rd building before Green Field hotel, seliat bus stop, Egbeda, Lagos.";

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
  if (!iso) return "-";
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

function formatLongDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
  mode: "details" | "invoice" | null;
  onClose: () => void;
  onOpenInvoice: () => void;
};

export default function OrderModals({ order, mode, onClose, onOpenInvoice }: Props) {
  if (!order || !mode) return null;

  const downloadInvoice = () => {
    try {
      printOrderInvoice(order);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not open invoice");
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
          <h2 className="text-lg font-semibold text-neutral-900">
            {mode === "invoice" ? "Invoice" : "Order Details"}
          </h2>
          {mode === "details" ? (
            <button
              type="button"
              onClick={onOpenInvoice}
              className="rounded-lg bg-[#4B0A6B] px-3 py-2 text-xs font-semibold text-white sm:text-sm"
            >
              View Invoice
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
            <ProductTable order={order} />
          </>
        )}

        {mode === "invoice" && (
          <>
            <div className="mt-4 flex items-start justify-between gap-6">
              <div className="shrink-0">
                <BrandLogo href={null} size="md" />
              </div>
              <div className="max-w-[14rem] text-right sm:max-w-[18rem]">
                <p className="text-sm font-bold text-neutral-900">{STORE_LEGAL_NAME}</p>
                <p className="mt-1 text-[11px] leading-snug text-neutral-600">{STORE_ADDRESS}</p>
              </div>
            </div>

            <h1 className="mt-8 text-2xl font-bold tracking-wide text-neutral-900">INVOICE</h1>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-6 text-sm">
              <div className="min-w-0 flex-1 space-y-1">
                {order.email ? <p className="font-semibold text-neutral-900">{order.email}</p> : null}
                <p className="text-neutral-600">Delivery: {deliveryLabel(order)}</p>
              </div>
              <dl className="space-y-1.5 text-sm">
                <MetaRow label="Invoice Number" value={order.invoiceNumber || order.id.slice(0, 8)} />
                <MetaRow label="Invoice Date" value={formatLongDate(order.date)} />
                <MetaRow label="Order Number" value={order.invoiceNumber || order.id.slice(0, 8)} />
                <MetaRow label="Order Date" value={formatLongDate(order.date)} />
                <MetaRow label="Payment Method" value={order.paymentMethod} />
                <MetaRow label="Delivery" value={deliveryLabel(order)} />
              </dl>
            </div>

            <div className="mt-6 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Quantity</th>
                    <th className="px-3 py-3 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={`${item.name}-${i}`} className="border-b border-neutral-200">
                      <td className="px-3 py-3 font-medium text-neutral-900">{item.name}</td>
                      <td className="px-3 py-3 text-neutral-700">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-medium text-neutral-900">
                        {formatNaira(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Delivery ({deliveryLabel(order)})</span>
                <span className="font-medium">
                  {(order.shippingFee ?? 0) > 0 ? formatNaira(order.shippingFee ?? 0) : "Free"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-900 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatNaira(order.total)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Date purchase: {formatDateTime(order.date)}
              {order.receivedAt ? ` · Received: ${formatDateTime(order.receivedAt)}` : ""}
            </p>

            <button
              type="button"
              onClick={downloadInvoice}
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="min-w-[7rem] font-semibold capitalize text-neutral-900">{value}</dd>
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
          <tr className="border-t border-neutral-100">
            <td colSpan={2} className="px-3 py-3 font-medium text-neutral-700">
              Delivery ({deliveryLabel(order)})
            </td>
            <td className="px-3 py-3 text-right font-medium text-neutral-900">
              {(order.shippingFee ?? 0) > 0 ? formatNaira(order.shippingFee ?? 0) : "Free"}
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
