export type ShippingMethodId =
  | "local_pickup"
  | "waybill"
  | "stockpile"
  | "lagos_delivery";

export type ShippingMethod = {
  id: ShippingMethodId;
  title: string;
  fee: number;
  note?: string;
};

export const WAYBILL_FEE = 500;
export const STOCKPILE_FEE = 50;
export const LOCAL_PICKUP_FEE = 50;
export const LAGOS_DELIVERY_FEE = 50;

export const STOCKPILE_DISCLAIMER =
  "Stockpiling should not exceed three weeks. Goods left longer are at the owner's risk.";

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "local_pickup",
    title: "Local pickup",
    fee: LOCAL_PICKUP_FEE,
    note: "₦50 pickup charge.",
  },
  {
    id: "waybill",
    title: "Waybill (outside Lagos)",
    fee: WAYBILL_FEE,
    note: "₦500 waybill charge. Type all valid order numbers in the note section.",
  },
  {
    id: "stockpile",
    title: "Stockpile",
    fee: STOCKPILE_FEE,
    note: `${STOCKPILE_DISCLAIMER} ₦50 stockpile fee.`,
  },
  {
    id: "lagos_delivery",
    title: "Lagos delivery",
    fee: LAGOS_DELIVERY_FEE,
    note: "₦50 base fee. Our rider will contact you for any extra delivery charges.",
  },
];

export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export function getShippingMethod(id: ShippingMethodId): ShippingMethod {
  return SHIPPING_METHODS.find((m) => m.id === id) ?? SHIPPING_METHODS[0]!;
}

export function shippingFeeFor(id: ShippingMethodId): number {
  return getShippingMethod(id).fee;
}
