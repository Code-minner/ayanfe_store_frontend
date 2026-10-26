/**
 * Retired. Card add-to-cart with size/color now uses `useProductQuickAdd`
 * (popup picker). Do not restore the old PDP `?pick=1` redirect.
 */
export function addProductFromCard(_opts: unknown): never {
  throw new Error(
    "addProductFromCard is retired. Use useProductQuickAdd() for card adds."
  );
}
