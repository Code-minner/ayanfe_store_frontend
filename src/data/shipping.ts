export type ShippingMethodId = "local_pickup" | "waybill" | "stockpile";

export type ShippingMethod = {
  id: ShippingMethodId;
  title: string;
  fee: number;
  note?: string;
};

/** Matches the previous storefront options. */
export const WAYBILL_FEE = 500;

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "local_pickup",
    title: "Local pickup",
    fee: 0,
  },
  {
    id: "waybill",
    title: "Waybill",
    fee: WAYBILL_FEE,
    note: "Please type out all valid order numbers in the note section for waybill.",
  },
  {
    id: "stockpile",
    title: "Stockpile",
    fee: 0,
    note:
      "Stockpiling should not exceed three weeks. Goods left longer are at the owner's risk.",
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
