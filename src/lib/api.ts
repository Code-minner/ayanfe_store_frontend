import { optimizeImage } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type PaymentConfig = {
  bank: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  checkoutFee: number;
  paystackPublicKey: string | null;
  payments: {
    paystack: boolean;
    bankTransfer: boolean;
  };
  storeName?: string;
};

export type AuthApiUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string | null;
};

export type ApiProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
};

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  categorySlug: string;
  category?: string | null;
  brand?: string | null;
  colors?: string[];
  variants?: ApiProductVariant[] | null;
  badge?: string | null;
  subtitle?: string | null;
  stock?: number;
  description?: string;
  href?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
};

function parseVariants(raw: ApiProduct["variants"]): ApiProductVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (v): v is ApiProductVariant =>
        Boolean(v) &&
        typeof v === "object" &&
        typeof v.id === "string" &&
        typeof v.label === "string" &&
        typeof v.price === "number" &&
        typeof v.stock === "number"
    )
    .map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      stock: v.stock,
    }));
}

export function mapApiProduct(p: ApiProduct, opts?: { thumb?: boolean }) {
  const thumb = opts?.thumb !== false;
  const image = thumb ? optimizeImage(p.image, 480) : p.image;
  const images = (p.images?.length ? p.images : [p.image]).map((src) =>
    thumb ? optimizeImage(src, 720) : src
  );
  const variants = parseVariants(p.variants);
  const prices = variants.length ? variants.map((v) => v.price) : [p.price];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image,
    images,
    price: p.price,
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    originalPrice: p.originalPrice ?? undefined,
    discountPercent: p.discountPercent ?? undefined,
    categorySlug: p.categorySlug,
    category: p.category ?? undefined,
    brand: p.brand || undefined,
    colors: p.colors ?? [],
    variants,
    badge: p.badge ?? undefined,
    subtitle: p.subtitle ?? undefined,
    stock: p.stock,
    description: p.description,
    href: p.href ?? `/product/${p.slug}`,
  };
}

export type ProductsPage = {
  products: ReturnType<typeof mapApiProduct>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function apiFetchProductsPage(opts?: {
  category?: string;
  featured?: boolean;
  newer?: boolean;
  limit?: number;
  page?: number;
  q?: string;
}): Promise<ProductsPage> {
  const qs = new URLSearchParams();
  if (opts?.category) qs.set("category", opts.category);
  if (opts?.featured) qs.set("featured", "true");
  if (opts?.newer) qs.set("new", "true");
  if (opts?.q) qs.set("q", opts.q);
  qs.set("lean", "true");
  qs.set("page", String(opts?.page ?? 1));
  qs.set("limit", String(opts?.limit ?? 24));

  const res = await fetch(`${API_URL}/products?${qs}`, {
    // Always hit the live API so landing/shop never stick on an empty build-time cache.
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Could not load products");
  const data = (await res.json()) as {
    products: ApiProduct[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  const limit = data.limit ?? opts?.limit ?? 24;
  const total = data.total ?? data.products?.length ?? 0;
  return {
    products: (data.products ?? []).map((p) => mapApiProduct(p, { thumb: true })),
    total,
    page: data.page ?? opts?.page ?? 1,
    limit,
    totalPages: data.totalPages ?? Math.max(1, Math.ceil(total / limit)),
  };
}

export async function apiFetchProducts(opts?: {
  category?: string;
  featured?: boolean;
  newer?: boolean;
  limit?: number;
  page?: number;
}): Promise<ReturnType<typeof mapApiProduct>[]> {
  const page = await apiFetchProductsPage(opts);
  return page.products;
}

export async function apiFetchProductBySlug(slug: string) {
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not load product");
  const data = (await res.json()) as { product: ApiProduct };
  return mapApiProduct(data.product, { thumb: false });
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson(res: Response) {
  return res.json().catch(() => ({}));
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const res = await fetch(`${API_URL}/checkout/payment-config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load payment settings");
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Invalid email or password");
  return data as { user: AuthApiUser; token: string };
}

export async function apiSendOtp(email: string, purpose: "signup" | "reset" = "signup") {
  const res = await fetch(`${API_URL}/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not send verification code");
  return data as {
    message: string;
    email: string;
    expiresIn: number;
    delivered?: boolean;
    previewCode?: string;
  };
}

export async function apiRegister(input: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  otp: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not create account");
  return data as { user: AuthApiUser; token: string };
}

export async function apiMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Session expired");
  return data as { user: AuthApiUser };
}

export async function apiUpdateProfile(
  token: string,
  body: { firstName?: string; lastName?: string; email?: string; phone?: string }
) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not update profile");
  return data as { user: AuthApiUser };
}

export async function apiChangePassword(
  token: string,
  oldPassword: string,
  newPassword: string
) {
  const res = await fetch(`${API_URL}/auth/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not update password");
  return data as { message: string };
}

export async function apiUploadAvatar(token: string, file: File) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not upload avatar");
  return data as { user: AuthApiUser };
}

export async function apiGetWishlist(token: string) {
  const res = await fetch(`${API_URL}/wishlist`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not load wishlist");
  return data as { items: ApiProduct[]; ids: string[]; slugs: string[] };
}

export async function apiAddWishlist(token: string, productSlugOrId: string) {
  // Prefer slug lookup — frontend catalog ids are often the slug, not the Neon cuid
  const looksLikeCuid = /^c[a-z0-9]{20,}$/i.test(productSlugOrId);
  const body = looksLikeCuid
    ? { productId: productSlugOrId }
    : { productSlug: productSlugOrId };
  const res = await fetch(`${API_URL}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not add to wishlist");
  return data as { product: ApiProduct };
}

export async function apiRemoveWishlist(token: string, productSlugOrId: string) {
  const res = await fetch(`${API_URL}/wishlist/${encodeURIComponent(productSlugOrId)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not remove from wishlist");
  return data as { removed: boolean };
}

type CheckoutItemInput = {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  brand?: string;
};

type CheckoutShippingInput = {
  method?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

function guestAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("ayanfe-token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitBankTransferOrder(input: {
  email: string;
  items: CheckoutItemInput[];
  customerNote?: string;
  shipping?: CheckoutShippingInput;
  receipt: File;
}) {
  const form = new FormData();
  form.append("email", input.email);
  form.append("items", JSON.stringify(input.items));
  if (input.customerNote) form.append("customerNote", input.customerNote);
  if (input.shipping) form.append("shipping", JSON.stringify(input.shipping));
  form.append("receipt", input.receipt);

  const res = await fetch(`${API_URL}/checkout/bank-transfer`, {
    method: "POST",
    headers: guestAuthHeaders(),
    body: form,
  });

  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not submit order");
  return data as {
    order: {
      id: string;
      _id?: string;
      invoiceNumber?: string;
      status: string;
      total: number;
      email: string;
    };
  };
}

export type CheckoutOrder = {
  id: string;
  _id?: string;
  invoiceNumber?: string | null;
  status: string;
  total: number;
  subtotal?: number;
  fee?: number;
  email: string;
  items?: {
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  paymentMethod?: string;
  createdAt?: string;
  shipping?: {
    method?: string;
    shippingFee?: number;
  } | null;
};

export async function createPaystackOrder(input: {
  email: string;
  items: CheckoutItemInput[];
  customerNote?: string;
  shipping?: CheckoutShippingInput;
}) {
  const res = await fetch(`${API_URL}/checkout/paystack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...guestAuthHeaders(),
    },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not create order");
  return data as { order: CheckoutOrder };
}

export async function initializePaystack(orderId: string, callbackUrl: string) {
  const res = await fetch(`${API_URL}/payments/paystack/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...guestAuthHeaders(),
    },
    body: JSON.stringify({ orderId, callback_url: callbackUrl }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not start Paystack payment");
  return data as {
    authorization_url: string;
    access_code: string;
    reference: string;
    orderId: string;
  };
}

export async function verifyPaystack(reference: string) {
  const res = await fetch(
    `${API_URL}/payments/paystack/verify/${encodeURIComponent(reference)}`,
    { cache: "no-store" }
  );
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not verify payment");
  return data as {
    order: CheckoutOrder;
    paystack: { status: string; reference: string };
  };
}

export type ApiOrder = {
  id: string;
  _id?: string;
  email: string;
  items: {
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  fee: number;
  total: number;
  paymentMethod: string;
  status: string;
  invoiceNumber?: string | null;
  createdAt: string;
  shipping?: {
    method?: string;
    shippingFee?: number;
    fullName?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
  } | null;
};

export async function apiFetchMyOrders(token: string) {
  const res = await fetch(`${API_URL}/orders/mine`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.message || "Could not load orders");
  return data as { orders: ApiOrder[] };
}

/** Same invoice HTML document staff use in admin (for in-app preview). */
export async function apiFetchMyInvoice(token: string, orderId: string) {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}/invoice`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const html = await res.text();
  if (!res.ok) {
    let message = "Could not open invoice";
    try {
      message = (JSON.parse(html) as { message?: string }).message || message;
    } catch {
      /* html error */
    }
    throw new Error(message);
  }
  return html;
}

export { API_URL };
