"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

function HeaderFallback() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { displayName } = useAuth();
  return (
    <Header
      cartCount={itemCount}
      wishlistCount={wishlistCount}
      userName={displayName || undefined}
      currentPath="/"
    />
  );
}

function HeaderWithPath() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { displayName } = useAuth();
  return (
    <Header
      cartCount={itemCount}
      wishlistCount={wishlistCount}
      userName={displayName || undefined}
      currentPath={pathname}
    />
  );
}

export default function SiteHeader() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderWithPath />
    </Suspense>
  );
}
