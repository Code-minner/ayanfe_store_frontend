import type { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F5F5F7]">
      <header className="px-5 py-7 sm:px-10 sm:py-8">
        <BrandLogo href="/" size="md" priority />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pb-20 pt-2 sm:items-center sm:px-8 sm:pt-0">
        {children}
      </main>
    </div>
  );
}
