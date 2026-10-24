export const STORE_HOURS = {
  weekdays: "10AM - 4PM, Monday to Friday",
  saturday: "1PM - 4PM Saturday (sometimes closed)",
  summary: "OPEN: 10AM - 4PM MONDAY-FRIDAY AND 1PM-4PM SATURDAY (SOMETIMES CLOSED)",
};

export const STORE_POLICY_SECTIONS: {
  title: string;
  items: string[];
}[] = [
  {
    title: "Opening hours",
    items: [
      "Open 10AM - 4PM, Monday to Friday.",
      "Open 1PM - 4PM on Saturday (sometimes closed).",
    ],
  },
  {
    title: "Returns & exchange",
    items: ["No refund.", "No exchange."],
  },
  {
    title: "Delivery",
    items: [
      "Delivery within Lagos: within 48 hours.",
      "Delivery outside Lagos: 3 to 5 days.",
      "Drop-off at park: Tuesdays and Thursdays for orders that came in before 2PM.",
      "Goods not picked within 1 month are at the owner's risk.",
      "No fixed amount for delivery. Price is subject to the weight of items.",
    ],
  },
  {
    title: "Stockpile",
    items: [
      "Stockpiling should not exceed three weeks.",
      "Orders left beyond this period are at the customer's risk.",
    ],
  },
];

export const PAYMENT_POLICY_ITEMS: string[] = [
  "You may pay with Paystack (card, bank, or USSD) or by bank transfer with proof of payment.",
  "Bank transfer orders are confirmed after our team verifies your receipt.",
  "Orders are not released for pickup or delivery until payment is confirmed.",
  "Delivery has no fixed fee. The amount depends on the weight of your items.",
  "Waybill and other shipment options may attract an extra fee shown at checkout.",
];
