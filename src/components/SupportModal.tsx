"use client";

import { STORE_CONTACT } from "@/data/contact";

type SupportModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SupportModal({ open, onClose }: SupportModalProps) {
  if (!open) return null;

  const { phoneDisplay, phoneTel, whatsapp, emails } = STORE_CONTACT;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close support"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-title"
        className="relative w-full max-w-md rounded-2xl bg-white px-6 py-8 text-center shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#F3E6F6] text-[#4B0A6B]">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path
              d="M4 12a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2h-1v-4a5 5 0 0 0-10 0v6h5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M18 18a2 2 0 0 1-2 2h-1" strokeLinecap="round" />
          </svg>
        </div>

        <h2 id="support-title" className="mt-5 text-2xl font-semibold text-[#4B0A6B]">
          Need Help?
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          We&apos;re here to assist with your orders, payments, or deliveries.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#4B0A6B] px-4 py-3 text-sm font-semibold text-white"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${phoneTel}`}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900"
          >
            Call {phoneDisplay}
          </a>
          <a
            href={`mailto:${emails[0]}`}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-900"
          >
            Email Support
          </a>
        </div>

        <a
          href="/contact"
          className="mt-5 inline-block text-sm font-medium text-[#4B0A6B] underline underline-offset-2"
          onClick={onClose}
        >
          Contact & FAQ page
        </a>
      </div>
    </div>
  );
}
