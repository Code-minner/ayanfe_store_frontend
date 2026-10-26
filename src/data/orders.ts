export type OrderStatusUi = "in_progress" | "completed" | "cancelled";

export type StoredOrderItem = {
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  brand?: string;
};

export type StoredOrder = {
  id: string;
  invoiceNumber?: string;
  date: string;
  status: OrderStatusUi;
  paymentMethod: string;
  paymentStatus: "confirmed" | "pending" | "failed";
  items: StoredOrderItem[];
  subtotal: number;
  fee: number;
  total: number;
  email?: string;
  receivedAt?: string;
  shippingMethod?: string;
  shippingFee?: number;
};

const STORAGE_KEY = "ayanfe-orders";

export function mapApiStatus(status: string): OrderStatusUi {
  if (status === "paid" || status === "shipped" || status === "processing") return "completed";
  if (status === "cancelled" || status === "failed") return "cancelled";
  return "in_progress";
}

export function mapPaymentStatus(status: string): StoredOrder["paymentStatus"] {
  if (status === "paid" || status === "shipped" || status === "processing") return "confirmed";
  if (status === "failed" || status === "cancelled") return "failed";
  return "pending";
}

export function mapApiOrder(order: {
  id: string;
  _id?: string;
  invoiceNumber?: string | null;
  createdAt: string;
  status: string;
  paymentMethod: string;
  items: StoredOrderItem[];
  subtotal: number;
  fee: number;
  total: number;
  email?: string;
  shipping?: { method?: string; shippingFee?: number } | null;
}): StoredOrder {
  const shippingFee = order.shipping?.shippingFee ?? 0;
  return {
    id: order.id || order._id || "",
    invoiceNumber: order.invoiceNumber || undefined,
    date: order.createdAt,
    status: mapApiStatus(order.status),
    paymentMethod: order.paymentMethod.replace(/_/g, " "),
    paymentStatus: mapPaymentStatus(order.status),
    items: order.items || [],
    subtotal: order.subtotal,
    fee: order.fee,
    total: order.total,
    email: order.email,
    shippingMethod: order.shipping?.method,
    shippingFee,
  };
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: StoredOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function addLocalOrder(order: StoredOrder) {
  const prev = loadOrders();
  saveOrders([order, ...prev.filter((o) => o.id !== order.id)]);
}

export function statusLabel(status: OrderStatusUi) {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

export function statusBadgeClass(status: OrderStatusUi) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "cancelled") return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-700";
}
