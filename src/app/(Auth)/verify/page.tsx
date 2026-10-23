"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { PENDING_SIGNUP_KEY, type PendingSignup } from "@/lib/authPending";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { apiSendOtp } from "@/lib/api";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const { register } = useAuth();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [active, setActive] = useState(0);
  const [seconds, setSeconds] = useState(59);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [delivered, setDelivered] = useState<boolean | null>(null);
  const [mailMessage, setMailMessage] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as PendingSignup;
      if (pending.previewCode) setPreviewCode(pending.previewCode);
      if (typeof pending.delivered === "boolean") setDelivered(pending.delivered);
      if (pending.mailMessage) setMailMessage(pending.mailMessage);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 3) {
      inputs.current[index + 1]?.focus();
      setActive(index + 1);
    }
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setActive(index - 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;
    const next = ["", "", "", ""];
    text.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    const focusAt = Math.min(text.length, 3);
    inputs.current[focusAt]?.focus();
    setActive(focusAt);
  };

  const onResend = async () => {
    if (seconds > 0 || resending) return;
    let pending: PendingSignup | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
      pending = raw ? (JSON.parse(raw) as PendingSignup) : null;
    } catch {
      pending = null;
    }
    const target = pending?.email || email;
    if (!target) {
      setError("Signup session expired. Please sign up again.");
      return;
    }

    setResending(true);
    setError("");
    try {
      const otp = await apiSendOtp(target, "signup");
      if (pending) {
        sessionStorage.setItem(
          PENDING_SIGNUP_KEY,
          JSON.stringify({
            ...pending,
            previewCode: otp.previewCode,
            delivered: Boolean(otp.delivered),
            mailMessage: otp.message,
          })
        );
      }
      setPreviewCode(otp.previewCode || "");
      setDelivered(Boolean(otp.delivered));
      setMailMessage(otp.message || "");
      setSeconds(59);
      setDigits(["", "", "", ""]);
      inputs.current[0]?.focus();
      setActive(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 4) {
      setError("Enter the 4-digit verification code.");
      return;
    }

    let pending: PendingSignup | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
      pending = raw ? (JSON.parse(raw) as PendingSignup) : null;
    } catch {
      pending = null;
    }

    if (!pending) {
      setError("Signup session expired. Please sign up again.");
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        phone: pending.phone,
        password: pending.password,
        otp: code,
      });
      sessionStorage.removeItem(PENDING_SIGNUP_KEY);
      router.push("/auth/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:px-10 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
        Verification code
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500">
        {delivered === false
          ? "We could not deliver email through ZeptoMail. Use the preview code below."
          : "A verification code was sent to"}{" "}
        <span className="font-semibold text-neutral-800">{email || "your email"}</span>
        {delivered !== false ? ". Check Inbox and Spam/Junk." : null}
      </p>

      {delivered === true && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          API accepted the email (no frontend error). If nothing arrives, open Spam, then confirm
          the sending domain <strong>ayanfewholesale.com</strong> is verified in ZeptoMail with
          SPF/DKIM. {mailMessage ? `(${mailMessage})` : null}
        </p>
      )}

      {previewCode && (
        <p className="mt-5 rounded-xl bg-[#F3E6F6] px-4 py-3 text-xs leading-relaxed text-[#4B0A6B]">
          Preview code (mail not delivered):{" "}
          <strong className="tracking-[0.2em]">{previewCode}</strong>
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-10">
        <div className="flex justify-center gap-3 sm:gap-4" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onFocus={() => setActive(i)}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className={`h-14 w-12 rounded-xl text-center text-lg font-semibold outline-none sm:h-16 sm:w-14 ${
                active === i || d
                  ? "border-2 border-[#4B0A6B] bg-white"
                  : "border border-transparent bg-[#F3E6F6]"
              }`}
            />
          ))}
        </div>

        {error && <p className="mt-5 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-10 w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner /> Verifying...
            </span>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <p className="mt-8 text-sm leading-relaxed text-neutral-600">
        Did not receive the email?{" "}
        <button
          type="button"
          onClick={() => {
            void onResend();
          }}
          className={`font-semibold ${
            seconds > 0 || resending ? "text-neutral-400" : "text-neutral-900 underline"
          }`}
          disabled={seconds > 0 || resending}
        >
          {resending ? "Sending..." : "Resend"}
        </button>
        {seconds > 0 && <span className="text-neutral-500"> in {seconds}s</span>}
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-sm text-neutral-500">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
