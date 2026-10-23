export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  /** Thumbnail used on the home Categories grid */
  icon: string;
}

export const SHOP_ALL: CategoryInfo = {
  slug: "shop",
  name: "Shop all",
  description: "Browse every category in one place.",
  heroImage: "/assets/shopall.png",
  icon: "/assets/shopall.png",
};

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "ladies",
    name: "Ladies' footwears",
    description: "Discover stylish footwear for every occasion.",
    heroImage: "/assets/ladies.jpg",
    icon: "/assets/Featured1.png",
  },
  {
    slug: "men",
    name: "Men's footwears",
    description: "Discover stylish footwear for every occasion.",
    heroImage: "/assets/men.png",
    icon: "/assets/Featured2.png",
  },
  {
    slug: "unisex",
    name: "Unisex footwears -sneakers",
    description: "Shared styles that work for everyone.",
    heroImage: "/assets/unisex.png",
    icon: "/assets/Featured3.png",
  },
  {
    slug: "kids",
    name: "Kids' footwears",
    description: "Comfortable shoes made for little explorers.",
    heroImage: "/assets/kids.png",
    icon: "/assets/Featured4.png",
  },
  {
    slug: "clothing",
    name: "Clothing/materials",
    description: "Fabrics and ready-to-wear pieces for every day.",
    heroImage: "/assets/clothing.png",
    icon: "/assets/Featured5.png",
  },
  {
    slug: "household",
    name: "House hold",
    description: "Useful finds for home and living.",
    heroImage: "/assets/hero8.png",
    icon: "/assets/Featured6.png",
  },
  {
    slug: "gadgets",
    name: "Gadgets",
    description: "Everyday tech and accessories.",
    heroImage: "/assets/gadgets.png",
    icon: "/assets/Featured7.png",
  },
  {
    slug: "personal-care",
    name: "Personal care",
    description: "Care essentials for your routine.",
    heroImage: "/assets/personal.png",
    icon: "/assets/Featured8.png",
  },
  {
    slug: "souvenirs",
    name: "Souvenirs",
    description: "Thoughtful gifts and keepsakes.",
    heroImage: "/assets/souvenirs.png",
    icon: "/assets/Featured9.png",
  },
];

export const getCategory = (slug: string) =>
  slug === SHOP_ALL.slug ? SHOP_ALL : CATEGORIES.find((c) => c.slug === slug);

export const categoryHref = (slug: string) => (slug === "shop" ? "/shop" : `/${slug}`);

/** Home categories grid: Shop all first, then the rest */
export const HOME_CATEGORIES: CategoryInfo[] = [SHOP_ALL, ...CATEGORIES];
