"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../../firebase/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [detailOrder, setDetailOrder] = useState(null);

  // تحميل الطلبات لايف
  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const unsub = onValue(ordersRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      setOrders(list.reverse());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // فلترة وفرز
  const filtered = useMemo(() => {
    let list = orders.slice();

    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o) => {
        return (
          (o.personal?.name || "").toLowerCase().includes(q) ||
          (o.personal?.email || "").toLowerCase().includes(q) ||
          (o.personal?.phone || "").toLowerCase().includes(q) ||
          (o.id || "").toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "createdAt_desc")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "createdAt_asc")
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "total_desc")
      list.sort((a, b) => (b.totals?.total || 0) - (a.totals?.total || 0));
    else if (sortBy === "total_asc")
      list.sort((a, b) => (a.totals?.total || 0) - (b.totals?.total || 0));

    return list;
  }, [orders, query, statusFilter, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // تحديد طلب
  const toggleSelect = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const selectAllPage = () => {
    const s = new Set(selected);
    pageItems.forEach((it) => s.add(it.id));
    setSelected(s);
  };

  const clearSelection = () => setSelected(new Set());

  // تغيير حالة طلب
  const changeStatus = async (id, newStatus) => {
    await update(ref(db, `orders/${id}`), { status: newStatus });
  };

  // حذف جماعي
  const bulkDelete = async () => {
    if (!selected.size) return;
    const removes = Array.from(selected).map((id) =>
      remove(ref(db, `orders/${id}`))
    );
    await Promise.all(removes);
    clearSelection();
  };

  // تصدير CSV
  const exportCSV = () => {
    const rows = filtered.map((o) => ({
      id: o.id,
      name: o.personal?.name || "",
      email: o.personal?.email || "",
      phone: o.personal?.phone || "",
      total: o.totals?.total || 0,
      status: o.status || "",
      createdAt: o.createdAt || "",
    }));

    if (!rows.length) return;

    const header = Object.keys(rows[0]).join(",");
    const csv =
      header +
      "\n" +
      rows
        .map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تصدير_الطلبات_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#071024] to-[#000814] text-white font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
            <p className="text-sm text-gray-300">لوحة تحكم احترافية — متابعة الطلبات لحظياً</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <FaSearch className="text-gray-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم، الهاتف، الإيميل، رقم الطلب..."
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-3 py-2 bg-cyan-600/20 border border-cyan-500 rounded-lg text-sm flex items-center gap-2 hover:bg-cyan-600/30"
              >
                <FaDownload /> تصدير
              </button>

              <button
                onClick={bulkDelete}
                className="px-3 py-2 bg-red-600/20 border border-red-500 rounded-lg text-sm flex items-center gap-2 hover:bg-red-600/30"
              >
                <FaTrash /> حذف
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="all">كل الحالات</option>
              <option value="processing">قيد المعالجة</option>
              <option value="confirmed">مؤكد</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2">
            <span className="text-sm text-gray-300">الترتيب</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="createdAt_desc">الأحدث</option>
              <option value="createdAt_asc">الأقدم</option>
              <option value="total_desc">الأعلى سعراً</option>
              <option value="total_asc">الأقل سعراً</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={selectAllPage} className="px-3 py-2 bg-white/5 rounded-lg text-sm">تحديد الصفحة</button>
            <button onClick={clearSelection} className="px-3 py-2 bg-white/5 rounded-lg text-sm">إلغاء التحديد</button>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">جاري تحميل الطلبات…</div>
          ) : pageItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">لا توجد طلبات.</div>
          ) : (
            pageItems.map((o) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl p-4 border border-white/6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggleSelect(o.id)}
                        className="accent-cyan-400"
                      />

                      <div className="text-sm font-semibold">
                        {o.personal?.name || "—"}
                      </div>
                    </div>

                    <div className="text-xs text-gray-300 mt-2">
                      {o.personal?.email || "—"} • {o.personal?.phone || "—"}
                    </div>

                    <div className="mt-3 text-sm text-gray-200 flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-white/10 text-xs">
                        {translateStatus(o.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-300">
                      {(o.totals?.total || 0).toLocaleString()} ج
                    </div>

                    <div className="flex flex-col items-end gap-2 mt-3">
                      <button
                        onClick={() => setDetailOrder(o)}
                        className="px-3 py-1 bg-white/10 rounded-md text-sm flex items-center gap-2"
                      >
                        <FaEye /> عرض
                      </button>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => changeStatus(o.id, "confirmed")}
                          className="px-2 py-1 bg-green-600/20 rounded-md text-sm"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => changeStatus(o.id, "cancelled")}
                          className="px-2 py-1 bg-red-600/20 rounded-md text-sm"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-300">
            عدد الطلبات: {filtered.length} — صفحة {page} من {pages}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 bg-white/5 rounded-md"
            >
              السابق
            </button>

            <button
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="px-3 py-2 bg-white/5 rounded-md"
            >
              التالي
            </button>
          </div>
        </div>

        {/* View Order Modal */}
        {detailOrder && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-[#061026] to-[#08101a] p-6 rounded-2xl w-[92%] max-w-3xl text-white border border-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    الطلب رقم {detailOrder.id}
                  </h3>
                  <div className="text-gray-300 mt-1">
                    {detailOrder.personal?.name} •{" "}
                    {detailOrder.personal?.phone}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      changeStatus(detailOrder.id, "confirmed");
                      setDetailOrder({ ...detailOrder, status: "confirmed" });
                    }}
                    className="px-3 py-2 bg-green-600/20 rounded-md"
                  >
                    تأكيد
                  </button>

                  <button
                    onClick={() => {
                      changeStatus(detailOrder.id, "shipped");
                      setDetailOrder({ ...detailOrder, status: "shipped" });
                    }}
                    className="px-3 py-2 bg-cyan-600/20 rounded-md"
                  >
                    شحن
                  </button>

                  <button
                    onClick={() => {
                      changeStatus(detailOrder.id, "delivered");
                      setDetailOrder({ ...detailOrder, status: "delivered" });
                    }}
                    className="px-3 py-2 bg-indigo-600/20 rounded-md"
                  >
                    تسليم
                  </button>

                  <button
                    onClick={() => {
                      remove(ref(db, `orders/${detailOrder.id}`));
                      setDetailOrder(null);
                    }}
                    className="px-3 py-2 bg-red-600/20 rounded-md"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm text-gray-300">العنوان</h4>
                  <div className="mt-2 text-sm">
                    <div>{detailOrder.address?.street || "—"}</div>
                    <div className="text-gray-400 mt-1">
                      {detailOrder.address?.city} •{" "}
                      {detailOrder.address?.state}
                    </div>
                  </div>

                  <h4 className="text-sm text-gray-300 mt-4">المنتجات</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    {detailOrder.cart?.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between"
                      >
                        <div className="truncate max-w-[260px]">
                          {(it.name && (it.name.ar || it.name)) || it.title}
                        </div>
                        <div className="text-sm font-semibold">
                          {it.quantity} × {(it.price || 0).toLocaleString()} ج
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-gray-300">الإجمالي</h4>

                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>السعر الفرعي</span>
                      <span>
                        {detailOrder.totals?.subtotal?.toLocaleString?.() ??
                          detailOrder.totals?.subtotal}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>الخصم</span>
                      <span>
                        -
                        {detailOrder.totals?.discount?.toLocaleString?.() ??
                          detailOrder.totals?.discount}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-cyan-300 mt-2">
                      <span>الإجمالي</span>
                      <span>
                        {detailOrder.totals?.total?.toLocaleString?.() ??
                          detailOrder.totals?.total}{" "}
                        ج
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm text-gray-300 mt-6">بيانات إضافية</h4>
                  <div className="mt-2 text-sm text-gray-400">
                    تم الإنشاء: {new Date(detailOrder.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    طريقة الدفع: {detailOrder.paymentMethod}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    الحالة:{" "}
                    <span className="text-cyan-300">
                      {translateStatus(detailOrder.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setDetailOrder(null)}
                  className="px-4 py-2 bg-white/10 rounded-md"
                >
                  إغلاق
                </button>

                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-cyan-600/20 rounded-md"
                >
                  تصدير CSV
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ترجمة حالات الطلب
function translateStatus(s) {
  const map = {
    processing: "قيد المعالجة",
    confirmed: "مؤكد",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };
  return map[s] || s;
}
