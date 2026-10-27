/** Round money to 2 decimal places. */
export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function bonusIsConfigured(
  bonusQty?: number | null,
  bonusPercent?: number | null
): boolean {
  return (
    typeof bonusQty === "number" &&
    bonusQty >= 1 &&
    typeof bonusPercent === "number" &&
    bonusPercent > 0 &&
    bonusPercent <= 100
  );
}

export function bonusApplies(
  bonusQty: number | null | undefined,
  bonusPercent: number | null | undefined,
  productQty: number
): boolean {
  return bonusIsConfigured(bonusQty, bonusPercent) && productQty >= (bonusQty as number);
}

export function unitPriceWithBonus(
  listPrice: number,
  bonusQty: number | null | undefined,
  bonusPercent: number | null | undefined,
  productQty: number
): number {
  if (!bonusApplies(bonusQty, bonusPercent, productQty)) return listPrice;
  return roundMoney(listPrice * (1 - (bonusPercent as number) / 100));
}

export function formatBonusOffer(
  bonusQty?: number | null,
  bonusPercent?: number | null
): string | null {
  if (!bonusIsConfigured(bonusQty, bonusPercent)) return null;
  return `Buy ${bonusQty}+, get ${bonusPercent}% off`;
}

export function productQtyInCart(
  items: { productId: string; quantity: number }[],
  productId: string
): number {
  return items
    .filter((i) => i.productId === productId)
    .reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotalWithBonus(
  items: {
    productId: string;
    price: number;
    quantity: number;
    bonusQty?: number | null;
    bonusPercent?: number | null;
  }[]
): number {
  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) || 0) + item.quantity
    );
  }
  return roundMoney(
    items.reduce((sum, item) => {
      const productQty = qtyByProduct.get(item.productId) || item.quantity;
      const unit = unitPriceWithBonus(
        item.price,
        item.bonusQty,
        item.bonusPercent,
        productQty
      );
      return sum + unit * item.quantity;
    }, 0)
  );
}
