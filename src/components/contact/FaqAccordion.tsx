"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/contact";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <li key={item.question}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? -1 : index)}
              className="flex w-full items-start justify-between gap-4 py-4 text-left"
            >
              <span
                className={`text-sm font-medium sm:text-base ${
                  open ? "text-[#4B0A6B]" : "text-neutral-900"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                  open
                    ? "border-[#4B0A6B] bg-[#4B0A6B] text-white"
                    : "border-neutral-300 text-neutral-500"
                }`}
                aria-hidden
              >
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <p className="pb-4 pr-10 text-sm leading-relaxed text-neutral-600">
                {item.answer}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
