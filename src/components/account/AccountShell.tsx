"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/account", label: "Edit profile" },
  { href: "/account/password", label: "Change password" },
];

export default function AccountShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-neutral-200 p-5 md:border-b-0 md:border-r md:p-6">
          <nav className="flex flex-col gap-1.5">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3.5 py-3 text-sm font-medium ${
                    active
                      ? "bg-[#F3E6F6] text-[#4B0A6B]"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
            {title}
          </h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
