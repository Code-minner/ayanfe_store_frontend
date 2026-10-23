import Link from "next/link";
import { formatNaira } from "@/lib/format";

interface CartSummaryProps {
  subtotal: number;
  total: number;
  primaryLabel: string;
  primaryHref?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  showContinueShopping?: boolean;
  editHref?: string;
}

export default function CartSummary({
  subtotal,
  total,
  primaryLabel,
  primaryHref,
  onPrimary,
  primaryDisabled,
  showContinueShopping = false,
  editHref,
}: CartSummaryProps) {
  const primaryClass =
    "flex w-full items-center justify-center rounded-xl bg-[#4B0A6B] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a0854] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-neutral-900">Cart Summary</h2>
        {editHref && (
          <Link
            href={editHref}
            aria-label="Edit cart"
            className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-[#4B0A6B] hover:text-[#4B0A6B]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <path d="M12 20h9" strokeLinecap="round" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-neutral-500">Subtotal</dt>
          <dd className="font-medium text-neutral-900">{formatNaira(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="font-semibold text-neutral-900">{formatNaira(total)}</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-3">
        {onPrimary ? (
          <button type="button" onClick={onPrimary} disabled={primaryDisabled} className={primaryClass}>
            {primaryLabel}
          </button>
        ) : (
          <Link
            href={primaryHref ?? "/checkout"}
            aria-disabled={primaryDisabled}
            className={`${primaryClass} ${primaryDisabled ? "pointer-events-none opacity-50" : ""}`}
          >
            {primaryLabel}
          </Link>
        )}

        {showContinueShopping && (
          <Link
            href="/shop"
            className="flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-sm font-medium text-neutral-900 transition-colors hover:border-[#4B0A6B] hover:text-[#4B0A6B]"
          >
            Continue shopping
          </Link>
        )}
      </div>
    </aside>
  );
}
