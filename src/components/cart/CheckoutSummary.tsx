import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  total: number;
  shippingFee?: number;
  shippingLabel?: string;
  onPay: () => void;
  payLabel?: string;
  payDisabled?: boolean;
}

export default function CheckoutSummary({
  items,
  subtotal,
  total,
  shippingFee = 0,
  shippingLabel = "Shipping",
  onPay,
  payLabel = "Pay Now",
  payDisabled,
}: CheckoutSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-neutral-900">Your order</h2>
        <Link
          href="/cart"
          aria-label="Edit cart"
          className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-[#4B0A6B] hover:text-[#4B0A6B]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M12 20h9" strokeLinecap="round" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <ul className="mt-5 divide-y divide-neutral-100">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-4 first:pt-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {item.color && (
                  <span
                    className="inline-block h-3 w-3 rounded-[2px] border border-neutral-300"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-xs text-neutral-600">{formatNaira(item.price)}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Qty {item.quantity}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-2 border-t border-neutral-100 pt-4">
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd className="font-medium text-neutral-900">{formatNaira(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-neutral-500">{shippingLabel}</dt>
            <dd className="font-medium text-neutral-900">
              {shippingFee > 0 ? formatNaira(shippingFee) : "Free"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
            <dt className="font-semibold text-neutral-900">Total</dt>
            <dd className="font-semibold text-[#4B0A6B]">{formatNaira(total)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onPay}
          disabled={payDisabled}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#4B0A6B] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a0854] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {payLabel}
        </button>
      </div>
    </aside>
  );
}
