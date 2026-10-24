"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ---------- CONFIG ---------- */

const PILL_PREFIX = "Welcome to our";
const PILL_WORDS: string[] = ["footwear", "lifestyle finds", "everyday essentials"];

const WORD_INTERVAL = 2800;
const FADE_TIME = 350;

type Tile = { src: string; aspect: string };

type Column = { direction: "up" | "down"; duration: string; tiles: Tile[] };

/* Masonry-style columns: mixed products + varied heights */
const COLUMNS: Column[] = [
  {
    direction: "up",
    duration: "14s",
    tiles: [
      { src: "/assets/gadgets.png", aspect: "aspect-[3/4]" },
      { src: "/assets/clothing.png", aspect: "aspect-square" },
      { src: "/assets/personal.png", aspect: "aspect-[4/5]" },
    ],
  },
  {
    direction: "down",
    duration: "18s",
    tiles: [
      { src: "/assets/ladies.jpg", aspect: "aspect-[4/3]" },
      { src: "/assets/souvenirs.png", aspect: "aspect-[3/4]" },
      { src: "/assets/kids.png", aspect: "aspect-square" },
    ],
  },
  {
    direction: "up",
    duration: "16s",
    tiles: [
      { src: "/assets/hero4.png", aspect: "aspect-[5/4]" },
      { src: "/assets/unisex.png", aspect: "aspect-[3/4]" },
      { src: "/assets/men.png", aspect: "aspect-[4/5]" },
    ],
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- ROTATING WORD ---------- */

function useRotatingWord(words: string[]) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setPhase("out");
      swapTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("in");
      }, FADE_TIME);
    }, WORD_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(swapTimer);
    };
  }, [words.length]);

  return { word: words[index], phase };
}

/* ---------- SLIDING COLUMN ---------- */

function SlideColumn({ direction, tiles, duration }: Column) {
  const loop = [...tiles, ...tiles];

  return (
    <div className="h-full overflow-hidden">
      <div
        className={direction === "up" ? "hero-slide-up" : "hero-slide-down"}
        style={{ animationDuration: duration }}
      >
        {loop.map((tile, i) => (
          <div
            key={`${tile.src}-${i}`}
            className={`relative mb-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white sm:mb-2.5 ${tile.aspect}`}
          >
            <Image
              src={tile.src}
              alt=""
              fill
              sizes="(min-width: 768px) 15vw, 30vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-110"
              priority={i < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- WELCOME BADGE ---------- */

function WelcomeBadge({ word, phase }: { word: string; phase: "in" | "out" }) {
  return (
    <div className="inline-flex max-w-full origin-left -rotate-[3deg]" aria-live="polite">
      <span className="inline-flex items-center gap-2 rounded-full border border-[#4B0A6B]/20 bg-white py-1.5 pl-4 pr-1.5 text-sm text-[#4B0A6B] shadow-[0_12px_32px_rgba(75,10,107,0.12)] sm:py-2 sm:pl-5 sm:pr-2">
        <span className="welcome-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#4B0A6B]" aria-hidden />
        <span className="font-medium tracking-wide text-[#4B0A6B]/75">{PILL_PREFIX}</span>
        <span className="relative inline-flex min-w-[8.5rem] items-center justify-center overflow-hidden rounded-full bg-[#4B0A6B] px-3.5 py-1.5 text-center text-sm font-semibold text-white sm:min-w-[9.5rem] sm:px-4">
          <span
            key={word}
            className={`block whitespace-nowrap transition-all ease-out motion-reduce:transition-none ${
              phase === "in" ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
            }`}
            style={{ transitionDuration: `${FADE_TIME}ms` }}
          >
            {word}
          </span>
        </span>
      </span>
    </div>
  );
}

/* ---------- HERO ---------- */

export default function Hero() {
  const { word, phase } = useRotatingWord(PILL_WORDS);
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease },
        };

  return (
    <section className="relative overflow-hidden bg-white">
      <style>{`
        @keyframes hero-up   { from { transform: translateY(0); }    to { transform: translateY(-50%); } }
        @keyframes hero-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        @keyframes welcome-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.45; }
        }
        .hero-slide-up   { animation: hero-up   linear infinite; will-change: transform; }
        .hero-slide-down { animation: hero-down linear infinite; will-change: transform; }
        .hero-slider:hover .hero-slide-up,
        .hero-slider:hover .hero-slide-down { animation-play-state: paused; }
        .welcome-dot { animation: welcome-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .welcome-dot,
          .hero-slide-up,
          .hero-slide-down { animation: none; }
        }
      `}</style>

      <div className="container-page relative grid items-center gap-10 py-12 sm:gap-12 sm:py-14 md:grid-cols-2 lg:gap-14 lg:py-20">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <motion.p
            className="mb-4 font-[family-name:var(--font-anton)] text-xs uppercase tracking-[0.28em] text-[#4B0A6B]/70 sm:text-sm"
            {...fadeUp(0)}
          >
            Attog Store
          </motion.p>

          <motion.div className="mb-6 sm:mb-8" {...fadeUp(0.08)}>
            <WelcomeBadge word={word} phase={phase} />
          </motion.div>

          <motion.h1
            className="max-w-lg text-4xl font-semibold leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl sm:leading-[1.15] lg:text-[3.35rem]"
            {...fadeUp(0.16)}
          >
            Good finds and{" "}
            <span className="relative inline-block text-[#4B0A6B]">
              great choices
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 -z-10 h-2 rounded-full bg-[#E8CFF0]/90 sm:-bottom-1.5 sm:h-2.5"
              />
            </span>{" "}
            for every day
          </motion.h1>

          <motion.p
            className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600 sm:mt-6 sm:text-base"
            {...fadeUp(0.26)}
          >
            From footwear and fashion to home, gadgets and everyday essentials — discover
            products that fit your style, your needs and your life, all in one place.
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9" {...fadeUp(0.36)}>
            <Link
              href="/shop"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-[#4B0A6B] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(75,10,107,0.28)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B]"
            >
              <span className="relative z-10">Shop All Products</span>
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-[#2E0544] transition-transform duration-300 group-hover:translate-y-0"
              />
              <span className="relative z-10 ml-2 transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="#categories"
              className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4B0A6B] hover:text-[#4B0A6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B0A6B]"
            >
              Explore Categories
            </Link>
          </motion.div>
        </div>

        {/* Visual — masonry collage */}
        <motion.div
          className="relative"
          initial={reduceMotion ? false : { opacity: 0, x: 36, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
        >
          <div
            className="hero-slider relative grid h-[390px] grid-cols-3 gap-2 overflow-hidden sm:h-[440px] sm:gap-2.5 md:h-[590px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
            }}
            aria-hidden="true"
          >
            {COLUMNS.map((col, i) => (
              <motion.div
                key={i}
                className="h-full min-w-0"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease }}
              >
                <SlideColumn {...col} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
