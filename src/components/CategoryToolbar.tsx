"use client";

import Link from "next/link";
import { FliterIcon } from "../../public/svg/svg";

interface CategoryToolbarProps {
  name: string;
  filterOpen?: boolean;
  activeFilterCount?: number;
  onFilterToggle?: () => void;
  resultLabel?: string;
}

export default function CategoryToolbar({
  name,
  filterOpen = false,
  activeFilterCount = 0,
  onFilterToggle,
  resultLabel,
}: CategoryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-neutral-400">
            <li>
              <Link href="/" className="transition-colors hover:text-neutral-700">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-neutral-300">
              &gt;
            </li>
            <li className="truncate font-semibold text-neutral-900" aria-current="page">
              {name}
            </li>
          </ol>
        </nav>
        {resultLabel ? (
          <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">{resultLabel}</p>
        ) : null}
      </div>

      <button
        type="button"
        aria-label={filterOpen ? "Close filters" : "Open filters"}
        aria-expanded={filterOpen}
        onClick={onFilterToggle}
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <FliterIcon size={28} aria-hidden />
        {activeFilterCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B0080] px-1 text-[10px] font-semibold leading-none text-white">
            {activeFilterCount > 9 ? "9+" : activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
