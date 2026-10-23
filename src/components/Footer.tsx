import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  LogoWhite,
  InstagramIcon,
  XIcon,
  FacebookIcon,
  MailIcon,
} from "../../public/svg/svg";

import { Suspense } from "react";
import CurrentYear from "./CurrentYear";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface FooterProps {
  logo?: ReactNode;
  columns?: FooterColumn[];
  socials?: SocialLink[];
  brandName?: string;
  className?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All Products", href: "/shop" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Shop by Category", href: "/categories" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & condition", href: "/terms" },
      { label: "Payment Policy", href: "/payment-policy" },
    ],
  },
];

const DEFAULT_SOCIALS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/", icon: InstagramIcon },
  { label: "X", href: "https://x.com/", icon: XIcon },
  { label: "Facebook", href: "https://facebook.com/", icon: FacebookIcon },
  { label: "Email", href: "mailto:hello@ayanfestore.com", icon: MailIcon },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Footer({
  logo,
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  brandName = "Ayanfe Store",
  className = "",
}: FooterProps) {
  return (
    <footer className={`bg-[#4F0065] text-white ${className}`}>
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.8fr_3fr] lg:py-16">
        <div>
          <Link href="/" aria-label={`${brandName} home`} className="inline-block">
            {logo ?? (
              <span className="flex flex-col items-start gap-2">
                <LogoWhite className="h-10 w-auto text-white" />
                <span className="font-[family-name:var(--font-anton)] text-2xl uppercase leading-none tracking-wide">
                  {brandName}
                </span>
              </span>
            )}
          </Link>

          <ul className="mt-6 flex items-center gap-4">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex h-5 w-5 items-center justify-center text-white transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Icon className="h-full w-full" />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-white/90">
            &copy;
            <Suspense fallback="2026">
              <CurrentYear />
            </Suspense>{" "}
            {brandName}. All Rights Reserved
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-[family-name:var(--font-anton)] text-lg tracking-wide">
                {col.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-4">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:text-white focus-visible:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
