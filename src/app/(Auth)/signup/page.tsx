"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import PasswordInput from "@/components/auth/PasswordInput";
import Spinner from "@/components/ui/Spinner";
import { PENDING_SIGNUP_KEY } from "@/lib/authPending";
import { apiSendOtp } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter your first and last name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    try {
      const otp = await apiSendOtp(normalizedEmail, "signup");
      sessionStorage.setItem(
        PENDING_SIGNUP_KEY,
        JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          password,
          delivered: Boolean(otp.delivered),
          previewCode: otp.previewCode,
          mailMessage: otp.message,
        })
      );
      router.push(`/verify?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-6 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:px-10 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
        Create an account
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500">
        Enter your details to join the Ayanfe marketplace.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-900">
            First name
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-[#4B0A6B]"
            />
          </label>
          <label className="block text-sm font-medium text-neutral-900">
            Last name
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-[#4B0A6B]"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-neutral-900">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Example@gmail.com"
            className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-[#4B0A6B]"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-900">
          Phone Number
          <div className="mt-2 flex overflow-hidden rounded-xl border border-neutral-300 focus-within:border-[#4B0A6B]">
            <span className="inline-flex items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-700">
              🇳🇬 +234
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full px-3.5 py-3 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </label>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-neutral-900">
            Password
          </label>
          <PasswordInput
            id="signup-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </div>

        <p className="text-xs leading-relaxed text-neutral-500">
          By signing up you agree to our{" "}
          <Link href="/help" className="underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/help" className="underline underline-offset-2">
            conditions
          </Link>
          .
        </p>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner /> Sending code...
            </span>
          ) : (
            "Sign up"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-neutral-900 underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
