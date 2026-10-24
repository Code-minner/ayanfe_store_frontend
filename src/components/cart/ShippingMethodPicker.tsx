"use client";

import { formatNaira } from "@/lib/format";
import {
  SHIPPING_METHODS,
  type ShippingMethodId,
} from "@/data/shipping";

type Props = {
  value: ShippingMethodId;
  onChange: (id: ShippingMethodId) => void;
  className?: string;
};

export default function ShippingMethodPicker({ value, onChange, className = "" }: Props) {
  return (
    <fieldset className={className}>
      <legend className="text-sm font-semibold text-neutral-900">Shipment</legend>
      <ul className="mt-3 space-y-3" role="radiogroup" aria-label="Shipment method">
        {SHIPPING_METHODS.map((m) => {
          const selected = value === m.id;
          return (
            <li key={m.id}>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                  selected
                    ? "border-[#4B0A6B] bg-[#F8F1FA]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="shipping-method"
                  className="mt-1 accent-[#4B0A6B]"
                  checked={selected}
                  onChange={() => onChange(m.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{m.title}</span>
                    <span className="text-sm font-medium text-neutral-800">
                      {m.fee > 0 ? formatNaira(m.fee) : "Free"}
                    </span>
                  </span>
                  {m.note && (
                    <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                      {m.note}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
