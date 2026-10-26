"use client";

import { useCallback, useState } from "react";
import ProductQuickPickModal from "@/components/ProductQuickPickModal";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import {
  cartLineFromProduct,
  productRequiresOptions,
  type Product,
} from "@/data/products";

/**
 * Add from a product card. Opens a size/color popup when options are required
 * instead of sending the shopper to the product page.
 */
export function useProductQuickAdd() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [pick, setPick] = useState<{ product: Product; quantity: number } | null>(
    null
  );

  const addFromCard = useCallback(
    (product: Product, quantity: number) => {
      if (productRequiresOptions(product)) {
        setPick({ product, quantity: Math.max(1, quantity) });
        return;
      }
      addItem(cartLineFromProduct(product), quantity);
      toast("Added to cart", "success");
    },
    [addItem, toast]
  );

  const closePick = useCallback(() => setPick(null), []);

  const modal = pick ? (
    <ProductQuickPickModal
      product={pick.product}
      initialQty={pick.quantity}
      open
      onClose={closePick}
      onConfirm={({ variantId, variantLabel, color, price, maxStock, quantity }) => {
        addItem(
          {
            productId: pick.product.id,
            variantId,
            variantLabel,
            size: variantLabel,
            brand: pick.product.brand,
            name: pick.product.name,
            image: pick.product.image,
            price,
            maxStock,
            color,
            href: pick.product.href ?? `/product/${pick.product.slug}`,
          },
          quantity
        );
        toast("Added. You can pick another size or color.", "success");
        // Keep popup open so they can add a different size/color (limits are per choice).
      }}
    />
  ) : null;

  return { addFromCard, modal };
}
