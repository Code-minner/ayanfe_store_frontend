"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderModals from "@/components/orders/OrderModals";
import {
  loadOrders,
  mapApiOrder,
  saveOrders,
  statusBadgeClass,
  statusLabel,
  type OrderStatusUi,
  type StoredOrder,
} from "@/data/orders";
import { useAuth } from "@/context/AuthContext";
import { apiFetchMyOrders } from "@/lib/api";
import { OrderEmptyIcon } from "./../../../../public/svg/svg";

const TABS: { id: "all" | OrderStatusUi; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const { isSignedIn, hydrated, token } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [selected, setSelected] = useState<StoredOrder | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    if (!hydrated) return;
    if (!isSignedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/orders")}`;
      return;
    }

    const local = loadOrders();
    setOrders(local);

    if (!token) return;
    apiFetchMyOrders(token)
      .then((data) => {
        const remote = (data.orders || []).map(mapApiOrder);
        const byId = new Map<string, StoredOrder>();
        for (const o of [...local, ...remote]) byId.set(o.id, o);
        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        saveOrders(merged);
        setOrders(merged);
      })
      .catch(() => {
        /* keep local fallback */
      });
  }, [hydrated, isSignedIn, token]);

  const filtered = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Orders" }]}
          />
          <h1 className="mt-4 font-serif text-3xl font-semibold text-[#4B0A6B] sm:text-4xl">
            My Orders
          </h1>

          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex gap-5 overflow-x-auto border-b border-neutral-100 pb-px">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 pb-3 text-sm font-medium ${
                      active
                        ? "border-b-2 border-[#4B0A6B] text-[#4B0A6B]"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-16 text-center">
                <div className="grid h-24 w-24 place-items-center ">
                  <OrderEmptyIcon className="h-12 w-12" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-neutral-900">
                  No orders yet
                </h2>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  Orders made for your product will be displayed here
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="text-neutral-500">
                      <tr>
                        <th className="px-2 py-3 font-medium">Order ID</th>
                        <th className="px-2 py-3 font-medium">Date</th>
                        <th className="px-2 py-3 font-medium">Status</th>
                        <th className="px-2 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-neutral-100"
                        >
                          <td className="px-2 py-4 font-medium text-neutral-900">
                            #{order.invoiceNumber || order.id.slice(0, 8)}
                          </td>
                          <td className="px-2 py-4 text-neutral-600">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-2 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                            >
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-2 py-4">
                            <button
                              type="button"
                              onClick={() => setSelected(order)}
                              className="inline-flex items-center gap-1 font-medium text-[#4B0A6B] hover:underline"
                            >
                              View Details
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  d="M9 6l6 6-6 6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 text-sm text-neutral-600">
                  <span>
                    Page {page} of {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />

      <OrderModals
        order={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
