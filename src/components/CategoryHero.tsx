import Image from "next/image";
import Link from "next/link";
import type { CategoryInfo } from "@/data/categories";

export default function CategoryHero({ name, description, heroImage }: CategoryInfo) {
  return (
    <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#2a2a2a] sm:min-h-[400px] lg:min-h-[440px]">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-5 py-16 text-center text-white sm:px-8 sm:py-20">
        <h1
          className="text-4xl uppercase leading-none tracking-wide sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-anton), Anton, Impact, sans-serif", fontWeight: 400 }}
        >
          {name}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/95 sm:text-base">
          {description}
        </p>
        <Link
          href="#products"
          className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-10 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Shop
        </Link>
      </div>
    </section>
  );
}
