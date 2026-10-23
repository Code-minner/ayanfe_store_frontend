"use client";

import { useId, useState, type FormEvent, type SVGProps } from "react";
import Image, { type StaticImageData } from "next/image";

/* -------------------------------------------------------------------------- */
/*  Icon                                                                       */
/* -------------------------------------------------------------------------- */

const MailOutlineIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 8 8 5.5L20 8" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface NewsletterSectionProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  image?: string | StaticImageData;
  imageAlt?: string;
  onSubscribe?: (email: string) => void | Promise<void>;
  className?: string;
}

type Status = "idle" | "loading" | "success" | "error";

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function NewsletterSection({
  title = "Join our newsletter",
  description = "Stay updated with new deals, tips, and trusted sellers all delivered straight to your inbox",
  buttonLabel = "Subscribe",
  image = "/assets/newsletter.png",
  imageAlt = "A smiling woman choosing clothes in a shop",
  onSubscribe,
  className = "",
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setStatus("loading");
    setMessage("");
    try {
      await onSubscribe?.(value);
      setStatus("success");
      setMessage("Thanks for subscribing. Check your inbox soon.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section className={`bg-[#F3E6F6] ${className}`}>
      <div className="container-page grid items-center gap-10 md:grid-cols-2">
        <div className="max-w-md py-10 md:py-14">
          <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide text-neutral-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">{description}</p>

          <form onSubmit={handleSubmit} className="mt-6 flex gap-3" noValidate={false}>
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white bg-white px-3 transition-shadow focus-within:ring-2 focus-within:ring-[#4B0A6B]">
              <MailOutlineIcon className="h-4 w-4 shrink-0 text-neutral-500" />
              <input
                id={inputId}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="w-full min-w-0 bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="h-11 shrink-0 rounded-xl bg-[#4B0A6B] px-6 text-sm font-medium text-white transition-colors hover:bg-purple-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Subscribing..." : buttonLabel}
            </button>
          </form>

          <p
            role="status"
            aria-live="polite"
            className={`mt-3 min-h-5 text-xs ${status === "error" ? "text-red-700" : "text-[#4B0A6B]"}`}
          >
            {message}
          </p>
        </div>

        <div className="relative mx-auto aspect-[380/264] w-full max-w-md md:max-w-none">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
