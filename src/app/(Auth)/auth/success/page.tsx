"use client";

import Link from "next/link";

export default function AuthSuccessPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-6 py-12 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:px-10 sm:py-14">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-[6px] border-[#4B0A6B]/25 bg-[#F3E6F6] text-[#4B0A6B]">
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-8 text-2xl font-bold tracking-tight text-neutral-900">Congratulations</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
        Your account has been successfully created. You can proceed to finish your account setup.
      </p>
      <Link
        href="/account"
        className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-semibold text-white"
      >
        Continue
      </Link>
    </div>
  );
}
