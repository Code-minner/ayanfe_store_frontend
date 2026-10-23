import Image from "next/image";
import Link from "next/link";
import { HOME_CATEGORIES, categoryHref } from "@/data/categories";

export default function Categories() {
  return (
    <section id="categories" className="section-y scroll-mt-28 bg-[#6B0080] text-white sm:scroll-mt-32">
      <div className="container-page text-center">
        <h2 className="section-heading">Find what you&rsquo;re looking for</h2>
        <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm">
          Explore our collections and discover something for every day, every occasion and every
          need.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-y-8">
          {HOME_CATEGORIES.map((cat) => (
            <li key={cat.slug} className="w-1/2 sm:w-1/3 md:w-[176px]">
              <Link
                href={categoryHref(cat.slug)}
                className="group flex flex-col items-center gap-3 rounded-lg px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span className="relative block h-[72px] w-[100px] transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src={cat.icon}
                    alt=""
                    fill
                    sizes="100px"
                    className="object-contain"
                  />
                </span>
                <span className="text-[13px] font-medium leading-tight">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
