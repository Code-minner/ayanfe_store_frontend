/** Shown on bank-transfer payment details. Swap for env/API values later. */
export type BankTransferDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export const BANK_TRANSFER: BankTransferDetails = {
  bankName: "OPay",
  accountName: "Olasupo Toyin",
  accountNumber: "8020705719",
};

/** No flat service fee. Totals are subtotal + shipping only. */
export const CHECKOUT_FEE = 0;

export type PaymentMethod = "paystack" | "bank_transfer";
