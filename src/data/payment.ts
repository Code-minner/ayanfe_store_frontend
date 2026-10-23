/** Shown on bank-transfer payment details. Swap for env/API values later. */
export const BANK_TRANSFER = {
  bankName: "First Bank",
  accountName: "AYANFE STORE",
  accountNumber: "9182747839",
} as const;

/** Flat checkout fee used in the design (subtotal ₦580,000 → total ₦583,500). */
export const CHECKOUT_FEE = 3500;

export type PaymentMethod = "paystack" | "bank_transfer";
