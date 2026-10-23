"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 pr-11 text-sm outline-none placeholder:text-neutral-400 focus:border-[#4B0A6B]"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          {show ? (
            <path
              d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9 9 0 0 1 12 5c5 0 9 5 9 7a10.7 10.7 0 0 1-3.2 4.5M6.1 6.1C4 7.8 3 10.2 3 12c0 2 4 7 9 7a8.7 8.7 0 0 0 4.1-1"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
