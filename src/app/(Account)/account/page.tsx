"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import AccountShell from "@/components/account/AccountShell";
import { useAuth } from "@/context/AuthContext";

export default function AccountProfilePage() {
  const { user, isSignedIn, hydrated, updateProfile, uploadAvatar, logout } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/account")}`;
    }
  }, [hydrated, isSignedIn]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phone);
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateProfile({ firstName, lastName, email, phone });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    }
  };

  const onAvatar = async (file: File | null) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploading(false);
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
              { label: "Edit profile" },
            ]}
          />

          <AccountShell title="Edit profile">
            <form onSubmit={onSave} className="max-w-xl space-y-5">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[#F3E6F6] text-[#4B0A6B]"
                  aria-label="Change avatar"
                >
                  {user?.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <span className="text-2xl font-semibold">
                      {(firstName[0] || "A").toUpperCase()}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-[#4B0A6B] text-white">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <div className="text-sm leading-relaxed text-neutral-500">
                  {uploading ? "Uploading..." : "Click the pencil to upload a photo"}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-neutral-800">
                  First name
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none focus:border-[#4B0A6B]"
                  />
                </label>
                <label className="block text-sm font-medium text-neutral-800">
                  Last name
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none focus:border-[#4B0A6B]"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-neutral-800">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm outline-none focus:border-[#4B0A6B]"
                />
              </label>

              <label className="block text-sm font-medium text-neutral-800">
                Phone Number
                <div className="mt-2 flex overflow-hidden rounded-xl border border-neutral-300 focus-within:border-[#4B0A6B]">
                  <span className="inline-flex items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3.5 text-sm text-neutral-700">
                    🇳🇬 +234
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm outline-none"
                  />
                </div>
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                className="rounded-xl bg-[#4B0A6B] px-6 py-3.5 text-sm font-semibold text-white"
              >
                {saved ? "Saved" : "Save changes"}
              </button>
            </form>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 px-5 py-5">
              <p className="text-sm font-medium text-red-600">Delete Your Account</p>
              <button
                type="button"
                className="rounded-xl bg-[#4B0A6B] px-5 py-3 text-sm font-semibold text-white"
                onClick={() => {
                  if (confirm("Log out and clear this device session?")) {
                    logout();
                    window.location.href = "/";
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </AccountShell>
        </div>
      </main>
      <Footer />
    </>
  );
}
