import type { Product } from "@/data/products";
import {
  cartLineFromProduct,
  productPageHref,
  productRequiresOptions,
} from "@/data/products";

type AddFn = (
  item: ReturnType<typeof cartLineFromProduct>,
  quantity?: number
) => void;

type ToastFn = (message: string, tone?: "default" | "success" | "error") => void;

/**
 * Card / landing add-to-cart. If the product has sizes or colors,
 * send the shopper to the product page instead of guessing options.
 */
export function addProductFromCard(opts: {
  product: Product;
  quantity: number;
  addItem: AddFn;
  toast: ToastFn;
  navigate: (href: string) => void;
}) {
  const { product, quantity, addItem, toast, navigate } = opts;

  if (productRequiresOptions(product)) {
    const needs: string[] = [];
    if (product.variants?.length) needs.push("size");
    if (product.colors?.length) needs.push("color");
    toast(
      `Please choose ${needs.join(" and ")} on the product page`,
      "default"
    );
    navigate(productPageHref(product, true));
    return;
  }

  addItem(cartLineFromProduct(product), quantity);
  toast("Added to cart", "success");
}
