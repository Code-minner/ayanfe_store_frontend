/** Shown on bank-transfer payment details. Swap for env/API values later. */
export type BankTransferDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export const BANK_TRANSFER: BankTransferDetails = {
  bankName: "First Bank",
  accountName: "ATTOG STORE",
  accountNumber: "9182747839",
};

/** Flat checkout fee used in the design (subtotal ₦580,000 → total ₦583,500). */
export const CHECKOUT_FEE = 3500;

export type PaymentMethod = "paystack" | "bank_transfer";
