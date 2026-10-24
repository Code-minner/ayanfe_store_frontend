"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import ShippingMethodPicker from "@/components/cart/ShippingMethodPicker";
import { useCart } from "@/context/CartContext";
import { getShippingMethod } from "@/data/shipping";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    fee,
    total,
    shippingMethod,
    shippingFee,
    setShippingMethod,
    increment,
    decrement,
    removeItem,
  } = useCart();

  const ship = getShippingMethod(shippingMethod);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
              <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                Cart ({itemCount})
              </h1>

              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-neutral-500">Your cart is empty.</p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex rounded-full bg-[#4B0A6B] px-6 py-2.5 text-sm font-medium text-white"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="mt-2">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onIncrement={() => increment(item.id)}
                      onDecrement={() => decrement(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <CartSummary
              subtotal={subtotal}
              fee={fee}
              shippingFee={shippingFee}
              shippingLabel={ship.title}
              total={total}
              primaryLabel="Proceed to checkout"
              primaryHref="/checkout"
              primaryDisabled={items.length === 0}
              showContinueShopping
            >
              {items.length > 0 && (
                <ShippingMethodPicker
                  value={shippingMethod}
                  onChange={setShippingMethod}
                />
              )}
            </CartSummary>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
