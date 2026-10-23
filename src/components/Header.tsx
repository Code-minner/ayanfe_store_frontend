"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  HeartIcon,
  CartIcon,
  Logo,
} from "../../public/svg/svg";
import AccountMenu from "@/components/AccountMenu";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  label: string;
  href: string;
  /** Sub-links. When present, the item opens a dropdown on hover/focus. */
  children?: NavItem[];
}

export interface HeaderProps {
  /** Your logo (an <img> or <svg>). Falls back to the default purple mark. */
  logo?: ReactNode;
  /** Where the logo links to. */
  homeHref?: string;
  navItems?: NavItem[];
  /** Called with the search text when the user submits the search field. */
  onSearch?: (query: string) => void;
  wishlistHref?: string;
  cartHref?: string;
  accountHref?: string;
  /** Shows a small badge on the cart icon when greater than 0. */
  cartCount?: number;
  /** Shows a small badge on the wishlist icon when greater than 0. */
  wishlistCount?: number;
  /** Greeting shown next to the account icon, e.g. "Hi, John Doe". */
  userName?: string;
  /** Path of the current page, used to highlight the active link. */
  currentPath?: string;
  /** Top black announcement strip. Pass `null` to hide. */
  announcement?: string | null;
  className?: string;
}

const DEFAULT_ANNOUNCEMENT = "Discover something you'll love at AYANFE STORE";

const DEFAULT_NAV: NavItem[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Ladies' footwears", href: "/ladies" },
  { label: "Men's footwears", href: "/men" },
  {
    label: "Others",
    href: "/unisex",
    children: [
      { label: "Unisex footwears -sneakers", href: "/unisex" },
      { label: "Clothing/materials", href: "/clothing" },
      { label: "Gadgets", href: "/gadgets" },
      { label: "Kids' footwears", href: "/kids" },
      { label: "House hold", href: "/household" },
      { label: "Personals", href: "/personal-care" },
      { label: "Souvenirs", href: "/souvenirs" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Header({
  logo,
  homeHref = "/",
  navItems = DEFAULT_NAV,
  onSearch,
  wishlistHref = "/wishlist",
  cartHref = "/cart",
  cartCount = 0,
  wishlistCount = 0,
  userName,
  currentPath,
  announcement = DEFAULT_ANNOUNCEMENT,
  className = "",
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const activePath = currentPath ?? "/";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const iconBtn =
    "relative inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-900 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

  const bar =
    "absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none";

  return (
    <header className={`sticky top-0 z-40 ${className} bg-black`}>
      {/* Top announcement strip */}
      {announcement && (
        <div className="bg-black px-4 pt-6 pb-4 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
          {announcement}
        </div>
      )}

      {/* Main nav */}
      <div className="border-b border-neutral-100 bg-white rounded-t-[30px]">
        <div className="container-page grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 sm:gap-4 sm:py-5">
          {/* Left: logo */}
          <Link
            href={homeHref}
            aria-label="Ayanfe Store home"
            className="justify-self-start text-[#4B0A6B]"
          >
            {logo ?? <Logo className="h-7 w-auto sm:h-8" />}
          </Link>

          {/* Centre: links (desktop) */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => {
                const active = activePath === item.href;
                const hasMenu = !!item.children?.length;
                return (
                  <li key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-haspopup={hasMenu ? "true" : undefined}
                      className={`relative inline-block py-2 text-[13px] font-semibold transition-colors hover:text-black ${
                        active ? "font-bold text-black" : "text-neutral-900"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-focus-within:scale-x-100 group-hover:scale-x-100 motion-reduce:transition-none"
                      />
                    </Link>

                    {hasMenu && (
                      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-200 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
                        <ul className="grid w-[min(29rem,calc(100vw-2rem))] grid-flow-col grid-cols-2 grid-rows-4 gap-x-8 gap-y-1 bg-white px-6 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.1)]">
                          {item.children!.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block whitespace-nowrap py-2 text-[13px] text-neutral-900 transition-colors hover:text-black focus-visible:text-black"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: search + icons */}
          <div className="col-start-3 flex items-center justify-self-end gap-1.5 sm:gap-2.5">
            <form
              role="search"
              onSubmit={handleSearch}
              className="hidden items-center gap-2 rounded-full border border-neutral-300 px-3 py-1.5 md:flex"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-neutral-700" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-20 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none lg:w-28"
              />
            </form>

            <Link
              href={wishlistHref}
              aria-label={`Wishlist, ${wishlistCount} items`}
              className={iconBtn}
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-[#4B0A6B] px-1 text-[10px] font-medium leading-none text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link href={cartHref} aria-label={`Cart, ${cartCount} items`} className={iconBtn}>
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-[#4B0A6B] px-1 text-[10px] font-medium leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <AccountMenu />

            <button
              type="button"
              className={`${iconBtn} lg:hidden`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <div className="relative h-4 w-6" aria-hidden>
                <div className={`${bar} top-0 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <div className={`${bar} top-[7px] ${menuOpen ? "opacity-0" : "opacity-100"}`} />
                <div className={`${bar} top-[14px] ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-neutral-200 bg-white lg:hidden"
        >
          <div className="container-page pb-5 pt-3">
            <form
              role="search"
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2.5 md:hidden"
            >
              <SearchIcon className="h-4 w-4 text-neutral-700" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </form>
            <ul className="mt-2 flex flex-col">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-3 text-sm text-neutral-900 hover:text-purple-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="mb-2 ml-3 border-l border-neutral-200 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block py-2 text-[13px] text-neutral-600 hover:text-purple-900"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
