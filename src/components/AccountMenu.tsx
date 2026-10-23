"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon } from "../../public/svg/svg";
import { useAuth } from "@/context/AuthContext";
import SupportModal from "@/components/SupportModal";

type AccountMenuProps = {
  className?: string;
};

export default function AccountMenu({ className = "" }: AccountMenuProps) {
  const { displayName, logout, isSignedIn, hydrated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (!isSignedIn) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={displayName ? `Account, ${displayName}` : "Account"}
        onClick={() => {
          if (!hydrated) return;
          if (!isSignedIn) {
            router.push("/login");
            return;
          }
          setOpen((v) => !v);
        }}
        className={`relative inline-flex h-9 items-center justify-center rounded-full text-neutral-900 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
          displayName ? "w-auto gap-1.5 px-1.5 sm:px-2" : "w-9"
        }`}
      >
        {user?.avatarUrl ? (
          <span className="relative h-7 w-7 overflow-hidden rounded-full">
            <Image src={user.avatarUrl} alt="" fill className="object-cover" sizes="28px" />
          </span>
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
        {displayName && (
          <span className="hidden max-w-[9rem] truncate text-xs font-medium text-neutral-900 sm:inline">
            Hi, {displayName}
          </span>
        )}
      </button>

      {open && isSignedIn && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-48 rounded-xl border border-neutral-200 bg-white py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          <p className="px-4 pb-2 text-sm font-bold text-neutral-900">Account</p>
          <ul className="text-sm text-neutral-600">
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => go("/account")}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => go("/orders")}
              >
                Orders
              </button>
            </li>
            <li>
              <Link
                href="/wishlist"
                role="menuitem"
                className="block px-4 py-2.5 hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setOpen(false)}
              >
                Wishlist
              </Link>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => {
                  setOpen(false);
                  setSupportOpen(true);
                }}
              >
                Help center
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => {
                  logout();
                  setOpen(false);
                  router.push("/");
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
