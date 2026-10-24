"use client";

import Link from "next/link";
import { Logo, LogoWhite } from "../../public/svg/svg";
import { BRAND_NAME } from "@/lib/brand";

type Size = "sm" | "md" | "lg";

/** Purple horizontal mark+wordmark (header, auth). */
const PURPLE_SIZE: Record<Size, string> = {
  sm: "h-6 w-auto max-w-[9.5rem] sm:h-7 sm:max-w-[11rem]",
  md: "h-7 w-auto max-w-[11rem] sm:h-8 sm:max-w-[13rem] md:h-9 md:max-w-none",
  lg: "h-8 w-auto max-w-[12rem] sm:h-10 sm:max-w-[14rem] md:h-11 md:max-w-none",
};

/** White stacked mark+wordmark (footer on dark). */
const WHITE_SIZE: Record<Size, string> = {
  sm: "h-10 w-auto max-w-[7rem] sm:h-12 sm:max-w-[8rem]",
  md: "h-12 w-auto max-w-[8.5rem] sm:h-14 sm:max-w-[10rem] md:h-16 md:max-w-none",
  lg: "h-14 w-auto max-w-[9.5rem] sm:h-16 sm:max-w-[11rem] md:h-[4.5rem] md:max-w-none",
};

export default function BrandLogo({
  href = "/",
  size = "md",
  /** Use white SVG for dark backgrounds (footer). */
  white = false,
  className = "",
}: {
  href?: string | null;
  size?: Size;
  white?: boolean;
  className?: string;
}) {
  const Mark = white ? LogoWhite : Logo;
  const sizeClass = white ? WHITE_SIZE[size] : PURPLE_SIZE[size];

  const mark = (
    <Mark className={`${sizeClass} shrink-0 object-contain object-left`} />
  );

  if (!href) {
    return (
      <span className={`inline-flex max-w-full items-center ${className}`} aria-label={BRAND_NAME}>
        {mark}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${BRAND_NAME} home`}
      className={`inline-flex max-w-full items-center ${className}`}
    >
      {mark}
    </Link>
  );
}
