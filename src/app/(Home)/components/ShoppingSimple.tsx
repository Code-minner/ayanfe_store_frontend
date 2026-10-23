import Link from "next/link";
import type { ReactNode } from "react";

/* ---------- ICONS ---------- */

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-[18px] w-[18px]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SearchIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

const TagIcon = () => (
  <svg {...iconProps}>
    <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.3 7.3a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.3-7.3a1 1 0 0 1-.3-.7Z" />
    <circle cx="8.5" cy="8.5" r="1.2" />
  </svg>
);

const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 7 8.5 6.5L20.5 7" />
  </svg>
);

/* ---------- DATA ---------- */

interface Feature {
  title: string;
  text: string;
  icon: ReactNode;
  card: string;
  badge: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    title: "Easy Product Discovery",
    text: "Browse categories or search to find the products you're looking for.",
    icon: <SearchIcon />,
    card: "bg-[#4B0066] text-white",
    badge: "bg-[#F1E4F5] text-[#4B0066]",
    body: "text-white/90",
  },
  {
    title: "Clear Payment Options",
    text: "Review the available payment methods and your order details at checkout.",
    icon: <TagIcon />,
    card: "bg-[#222222] text-white",
    badge: "bg-[#A8A8A8] text-[#222222]",
    body: "text-white/90",
  },
  {
    title: "Order Updates",
    text: "Receive email notifications to stay informed about your order.",
    icon: <MailIcon />,
    card: "bg-white text-[#14142B] border border-neutral-300",
    badge: "border border-neutral-400 text-neutral-900",
    body: "text-neutral-600",
  },
];

/* ---------- COMPONENT ---------- */

export default function ShoppingSimple({ shopHref = "/shop" }: { shopHref?: string }) {
  return (
    <section className="section-y bg-[#F4F4F4]" aria-labelledby="simple-title">
      <div className="container-page">
        <div className="mx-auto max-w-[680px] text-center">
          <h2 id="simple-title" className="section-heading text-[#6B0080]">
            Shopping made simple
          </h2>
          <p className="mt-4 text-sm text-neutral-900">
            Everything you need for a straightforward shopping experience.
          </p>

          <ul className="mt-9 grid gap-4 text-left sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className={`flex min-h-[162px] flex-col justify-between p-4 ${f.card}`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-full ${f.badge}`}>
                  {f.icon}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold leading-tight">{f.title}</h3>
                  <p className={`mt-2 text-xs leading-relaxed ${f.body}`}>{f.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={shopHref}
            className="mt-8 inline-block rounded-full border border-neutral-700 px-8 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B0080]"
          >
            Shop All
          </Link>
        </div>
      </div>
    </section>
  );
}
