import type { ShippingMethodId } from "@/data/shipping";

export type CheckoutDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  shippingMethod: ShippingMethodId;
  customerNote: string;
};

const KEY = "ayanfe-checkout-draft";

export const EMPTY_CHECKOUT_DRAFT: CheckoutDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "Lagos",
  country: "Nigeria",
  shippingMethod: "local_pickup",
  customerNote: "",
};

export function loadCheckoutDraft(): CheckoutDraft {
  if (typeof window === "undefined") return { ...EMPTY_CHECKOUT_DRAFT };
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_CHECKOUT_DRAFT };
    return { ...EMPTY_CHECKOUT_DRAFT, ...(JSON.parse(raw) as Partial<CheckoutDraft>) };
  } catch {
    return { ...EMPTY_CHECKOUT_DRAFT };
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearCheckoutDraft() {
  sessionStorage.removeItem(KEY);
}

export function draftToShippingPayload(draft: CheckoutDraft) {
  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim();
  return {
    method: draft.shippingMethod,
    fullName: fullName || undefined,
    firstName: draft.firstName.trim() || undefined,
    lastName: draft.lastName.trim() || undefined,
    phone: draft.phone.trim() || undefined,
    email: draft.email.trim() || undefined,
    address: draft.address.trim() || undefined,
    city: draft.city.trim() || undefined,
    state: draft.state.trim() || undefined,
    country: draft.country.trim() || undefined,
  };
}
