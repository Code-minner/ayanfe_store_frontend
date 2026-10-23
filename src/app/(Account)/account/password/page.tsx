"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import AccountShell from "@/components/account/AccountShell";
import { useAuth } from "@/context/AuthContext";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm font-medium text-neutral-800">
      {label}
      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-300 px-3.5 py-3 pr-11 text-sm outline-none focus:border-[#4B0A6B]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          aria-label={show ? "Hide password" : "Show password"}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            {show ? (
              <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9 9 0 0 1 12 5c5 0 9 5 9 7a10.7 10.7 0 0 1-3.2 4.5M6.1 6.1C4 7.8 3 10.2 3 12c0 2 4 7 9 7a8.7 8.7 0 0 0 4.1-1" strokeLinecap="round" />
            ) : (
              <>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
    </label>
  );
}

export default function ChangePasswordPage() {
  const { isSignedIn, hydrated, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/account/password")}`;
    }
  }, [hydrated, isSignedIn]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      setMessage("Password updated.");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Account", href: "/account" },
              { label: "Change password" },
            ]}
          />

          <AccountShell title="Change password">
            <form onSubmit={onSave} className="max-w-md space-y-5">
              <PasswordField
                label="Old password"
                value={oldPassword}
                onChange={setOldPassword}
                placeholder="Enter old password"
              />
              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
              />
              <PasswordField
                label="Confirm password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Confirm new password"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              {message && <p className="text-xs text-emerald-700">{message}</p>}
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#4B0A6B] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </AccountShell>
        </div>
      </main>
      <Footer />
    </>
  );
}
