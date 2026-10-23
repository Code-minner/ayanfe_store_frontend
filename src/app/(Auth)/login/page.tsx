"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import PasswordInput from "@/components/auth/PasswordInput";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white px-6 py-10 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:px-10 sm:py-12">
      <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
        Welcome Back to Ayanfe Store
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-500">
        Enter your login details below.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-medium text-neutral-900">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-neutral-500 hover:text-[#4B0A6B]">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#4B0A6B] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner /> Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-neutral-900 underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-sm text-neutral-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
