"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/firebase";
import { ref, onValue, get, update } from "firebase/database";
import {
  FaCheckCircle,
  FaBox,
  FaTruck,
  FaShippingFast,
  FaClock,
  FaReceipt,
  FaSearch,
  FaFilter,
  FaPrint,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCopy,
  FaChevronDown,
  FaSpinner,
  FaMapMarkerAlt,
  FaRegClock,
  FaFileDownload,
  FaTimesCircle,
} from "react-icons/fa";

// Ultra-Premium Orders Page (RTL) — single-file React component
// Usage: drop into a Next.js / React app with Tailwind CSS + framer-motion + firebase

export default function OrdersPage({ userId }) {
  const [orders, setOrders] = useState(null); // null = loading
  const [activeOrder, setActiveOrder] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [pageSize, setPageSize] = useState(8);
  const [loadingAction, setLoadingAction] = useState(false);
  const searchRef = useRef();

  // --- subscribe orders (primary + fallback) ---
  useEffect(() => {
    if (!userId) return setOrders([]);
    const primaryRef = ref(db, `orders/${userId}`);
    const fallbackRef = ref(db, `users/${userId}/orders`);

    const handleSnap = (snap) => {
      if (!snap) return;
      if (snap.exists()) {
        const data = snap.val() || {};
        const arr = Object.keys(data).map((id) => ({ id, ...data[id] }));
        // normalize date
        arr.forEach((o) => {
          if (!o.date) o.date = o.createdAt || new Date().toISOString();
        });
        setOrders(arr.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setOrders([]);
      }
    };

    const unsub1 = onValue(primaryRef, handleSnap, (e) => {});
    const unsub2 = onValue(fallbackRef, handleSnap, (e) => {});

    return () => {
      try { unsub1(); } catch(e){}
      try { unsub2(); } catch(e){}
    };
  }, [userId]);

  // --- helpers ---
  function t(v){ if(!v) return ""; if(typeof v === 'object') return v.ar||v.en||""; return String(v); }
  function langOr(ar,en){ return ar; }

  function getImageSrc(item){
    if(!item) return "/placeholder.png";
    if(typeof item.image === 'string' && item.image) return item.image;
    if(item.image && typeof item.image === 'object') return item.image.ar||item.image.en||'/placeholder.png';
    if(Array.isArray(item.images) && item.images.length) {
      const f = item.images[0];
      if(typeof f === 'string') return f; if(typeof f === 'object') return f.ar||f.en||'/placeholder.png';
    }
    return item.img||item.productImage||'/placeholder.png';
  }

  function calculateOrderTotal(order){
    const list = order.items || order.cart || [];
    return list.reduce((s,it)=> s + ((Number(it.quantity)||1) * (Number(it.price)||0)), 0);
  }

  function escapeHtml(unsafe){ return String(unsafe||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  // cancel order (client-side flag only if backend allows)
  async function cancelOrder(order){
    if(!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
    try{
      setLoadingAction(true);
      // optimistic UI: update local state
      setOrders(prev => prev?.map(o => o.id===order.id ? {...o, status: 'cancelled'} : o));
      // try to update firebase if path exists
      const node = ref(db, `orders/${userId}/${order.id}`);
      await update(node, { status: 'cancelled' }).catch(()=>{});
      setLoadingAction(false);
    }catch(e){ setLoadingAction(false); alert('حدث خطأ أثناء إلغاء الطلب'); }
  }

  // print invoice
  function printInvoice(order){
    const rows = (order.items||order.cart||[]).map(it=>{
      const name = escapeHtml(t(it.name)||t(it.title)||'');
      const qty = Number(it.quantity)||1;
      const price = Number(it.price)||0;
      const total = qty*price;
      return `<tr><td>${name}</td><td class="right">${qty}</td><td class="right">${price.toLocaleString()}</td><td class="right">${total.toLocaleString()}</td></tr>`;
    }).join('');

    const invoiceHtml = `
      <html dir="rtl">
      <head><meta charset="utf-8"/><title>فاتورة ${escapeHtml(order.id)}</title>
      <style>body{font-family:Arial,\n sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px} .right{text-align:right}</style>
      </head>
      <body>
        <h2>فاتورة الطلب — ${escapeHtml(order.id)}</h2>
        <div>التاريخ: ${new Date(order.date).toLocaleString('ar-EG')}</div>
        <div>العميل: ${escapeHtml(order.customerName||'')} — ${escapeHtml(order.customerPhone||'')}</div>
        <table><thead><tr><th>المنتج</th><th>كمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th colspan="3" class="right">الإجمالي</th><th class="right">${Number(order.total||order.amount||calculateOrderTotal(order)).toLocaleString()}</th></tr></tfoot></table>
      </body></html>`;

    const w = window.open('','PRINT','height=800,width=900');
    if(!w) return alert('يرجى السماح بنوافذ البوب-أب للطباعة');
    w.document.write(invoiceHtml); w.document.close(); w.focus(); setTimeout(()=>{ w.print(); w.close(); }, 500);
  }

  function copyToClipboard(text, successMsg='تم النسخ'){
    navigator.clipboard?.writeText(text).then(()=>alert(successMsg)).catch(()=>alert('فشل النسخ'));
  }

  // derived list
  const filtered = useMemo(()=>{
    if(orders === null) return null;
    let list = [...orders];
    const q = query.trim().toLowerCase();
    if(q){
      list = list.filter(o=> (
        String(o.id||'').toLowerCase().includes(q) ||
        String(o.customerName||'').toLowerCase().includes(q) ||
        (o.items||o.cart||[]).some(it=> (t(it.name)||t(it.title)||'').toLowerCase().includes(q))
      ));
    }
    if(statusFilter !== 'all'){
      list = list.filter(o => (o.status === statusFilter || (o.status && o.status.toLowerCase() === statusFilter)));
    }
    if(sort === 'newest') list.sort((a,b)=> new Date(b.date) - new Date(a.date));
    if(sort === 'oldest') list.sort((a,b)=> new Date(a.date) - new Date(b.date));
    if(sort === 'amount_desc') list.sort((a,b)=> (Number(b.total||b.amount||calculateOrderTotal(b)) - Number(a.total||a.amount||calculateOrderTotal(a))));
    if(sort === 'amount_asc') list.sort((a,b)=> (Number(a.total||a.amount||calculateOrderTotal(a)) - Number(b.total||b.amount||calculateOrderTotal(b))));
    return list.slice(0, pageSize);
  }, [orders, query, statusFilter, sort, pageSize]);

  // small UI helpers
  const steps = [
    { key: 'ordered', label: 'تم الطلب', icon: <FaBox /> },
    { key: 'processing', label: 'جاري التجهيز', icon: <FaClock /> },
    { key: 'shipped', label: 'تم الشحن', icon: <FaTruck /> },
    { key: 'out', label: 'خرج للتوصيل', icon: <FaShippingFast /> },
    { key: 'delivered', label: 'تم التوصيل', icon: <FaCheckCircle /> },
  ];

  function getStepIndex(status){ return Math.max(0, steps.findIndex(s=> s.key === status || s.label === status)); }

  // render
  return (
    <div className="w-full p-4 max-w-6xl mx-auto" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-cyan-300">لوحة الطلبات — حسابي</h1>
          <p className="text-sm text-gray-400">واجهة مرتبة تُظهر حالة الطلب، الفاتورة، وتتبع الشحنة.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input ref={searchRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ابحث باسم العميل، رقم الطلب، أو منتج..." className="pl-10 pr-4 py-2 rounded-xl bg-white/6 border border-white/6 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FaSearch /></div>
          </div>

          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="py-2 px-3 rounded-xl bg-white/6 border border-white/6">
              <option value="all">كل الحالات</option>
              <option value="ordered">تم الطلب</option>
              <option value="processing">جاري التجهيز</option>
              <option value="shipped">تم الشحن</option>
              <option value="out">خرج للتوصيل</option>
              <option value="delivered">تم التوصيل</option>
              <option value="cancelled">ملغى</option>
            </select>

            <select value={sort} onChange={(e)=>setSort(e.target.value)} className="py-2 px-3 rounded-xl bg-white/6 border border-white/6">
              <option value="newest">الأحدث أولًا</option>
              <option value="oldest">الأقدم أولًا</option>
              <option value="amount_desc">الأعلى مبلغًا</option>
              <option value="amount_asc">الأقل مبلغًا</option>
            </select>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {/* loading */}
        {orders === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_,i)=> (
              <div key={i} className="animate-pulse bg-white/5 h-36 rounded-2xl p-4" />
            ))}
          </div>
        )}

        {/* empty */}
        {orders && filtered && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-2xl mb-3">لا توجد طلبات</div>
            <div>سيظهر تاريخ طلباتك هنا فور إنشائها — جرب إعادة تحميل الصفحة أو التصفية.</div>
          </div>
        )}

       {/* list */}
<div className="flex flex-col gap-5">

  {filtered && filtered.map(order => {
    const idx = getStepIndex(order.status);
    const progress = ((idx + 1) / steps.length) * 100;

    return (
      <motion.article 
        key={order.id} 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        
        className="
          relative 
          bg-gradient-to-br from-[#071a41]/70 to-[#0b2356]/50
          border border-white/10 
          rounded-xl 
          p-4 
          shadow-xl 
          min-h-[230px]
          flex flex-col justify-between
        "
      >

        {/* top info */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl 
              bg-gradient-to-br from-cyan-600/25 to-blue-600/15 
              flex items-center justify-center text-xl text-cyan-300">
            <FaReceipt />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-300">
                  {langOr('رقم الطلب', 'Order ID')}: 
                  <span className="font-semibold text-cyan-300 ml-1">{order.id}</span>
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {new Date(order.date).toLocaleString('ar-EG')}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-cyan-300 text-lg">
                  {calculateOrderTotal(order).toLocaleString()} جنيه
                </div>
                <div className="text-xs text-gray-400">
                  {(order.items || order.cart || []).length} منتجات
                </div>
              </div>
            </div>

            {/* progress */}
            <div className="mt-3">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between mt-2 text-[11px] text-gray-300">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex flex-col items-center w-1/5">
                    <div 
                      className={`
                        p-2 rounded-full 
                        ${i <= idx 
                          ? 'bg-cyan-500/20 text-cyan-300' 
                          : 'bg-white/5 text-white/40'
                        }
                      `}
                    >
                      {s.icon}
                    </div>
                    <div className="mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* bottom actions */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => setActiveOrder(order)} 
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
          >
            {langOr('تفاصيل', 'Details')}
          </button>

          <button 
            onClick={() => printInvoice(order)} 
            className="px-3 py-2 rounded-lg bg-cyan-600 text-white flex items-center gap-2 text-sm"
          >
            <FaPrint /> {langOr('طباعة', 'Print')}
          </button>
        </div>

      </motion.article>
    );
  })}
</div>

{/* load more */}
{orders && orders.length > pageSize && (
  <div className="text-center mt-5">
    <button 
      onClick={() => setPageSize(s => s + 8)} 
      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
    >
      عرض المزيد
    </button>
  </div>
)}
</main>

      {/* modal */}
   {/* modal */}
<AnimatePresence>
  {activeOrder && (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
className="fixed inset-0 z-50 overflow-y-auto bg-black/60 pt-35"

>

    
      <motion.div
        id="order-modal-content"
        initial={{ scale: 0.98, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 8 }}
className="w-full max-w-2xl bg-[#04102a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col scale-95"

      >
        {/* header */}
        <div className="p-6 border-b border-white/6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-2xl font-bold text-cyan-300">
                {langOr("تفاصيل الطلب", "Order Details")}
              </h3>
              <div className="text-sm text-gray-300">
                {langOr("رقم الطلب", "Order ID")}: {activeOrder.id}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(activeOrder.date).toLocaleString("ar-EG")}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-3 py-2 rounded-lg bg-white/6"
              >
                {langOr("إغلاق", "Close")}
              </button>

              <button
                onClick={() => printInvoice(activeOrder)}
                className="px-3 py-2 rounded-lg bg-cyan-500 text-white flex items-center gap-2"
              >
                <FaPrint /> {langOr("طباعة", "Print")}
              </button>
            </div>
          </div>
        </div>

        {/* body with scroll */}
       <div className="modal-body p-6 overflow-y-auto flex-1">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* left section */}
            <div className="md:col-span-2 space-y-4">

              {/* items */}
              <h4 className="text-sm text-gray-300">{langOr("العناصر", "Items")}</h4>

              {(activeOrder.items || activeOrder.cart || []).map((it, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <img
                    src={getImageSrc(it)}
                    className="w-16 h-16 object-cover rounded-md"
                    alt=""
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{t(it.name) || t(it.title)}</div>
                    <div className="text-sm text-gray-400">
                      {(Number(it.quantity) || 1)} ×{" "}
                      {(Number(it.price) || 0).toLocaleString()} جنيه
                    </div>
                  </div>
                  <div className="font-semibold">
                    {(
                      (Number(it.quantity) || 1) * (Number(it.price) || 0)
                    ).toLocaleString()}{" "}
                    جنيه
                  </div>
                </div>
              ))}

              {/* timeline + address */}
              <div className="mt-3 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaMapMarkerAlt />
                  <div className="font-semibold">
                    {activeOrder.address?.label ||
                      activeOrder.address?.street ||
                      "عنوان التوصيل"}
                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  {activeOrder.address?.notes}
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-300 mb-2">{langOr("المسار", "Timeline")}</div>

                  <div className="flex flex-col gap-2">
                    {steps.map((s, i) => (
                      <div key={s.key} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            i <= getStepIndex(activeOrder.status)
                              ? "bg-cyan-400"
                              : "bg-white/10"
                          }`}
                        />
                        <div className="text-sm text-gray-300">{s.label}</div>
                        <div className="text-xs text-gray-500 mr-auto">
                          {i <= getStepIndex(activeOrder.status)
                            ? new Date(activeOrder.date).toLocaleString("ar-EG")
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* right summary */}
            <div className="md:col-span-1 bg-white/5 p-4 rounded-xl">
              <div className="text-sm text-gray-300 mb-2">
                {langOr("ملخص الطلب", "Summary")}
              </div>

              <div className="flex justify-between text-gray-300 mb-1">
                <div>{langOr("الإجمالي", "Subtotal")}</div>
                <div>{calculateOrderTotal(activeOrder).toLocaleString()} جنيه</div>
              </div>

              <div className="flex justify-between font-bold text-cyan-300 text-lg mb-3">
                <div>{langOr("الإجمالي الكلي", "Total")}</div>
                <div>
                  {(
                    Number(activeOrder.total ||
                      activeOrder.amount ||
                      calculateOrderTotal(activeOrder))
                  ).toLocaleString()}{" "}
                  جنيه
                </div>
              </div>

              {activeOrder.address && (
                <div className="text-gray-400 text-sm leading-6 mb-3">
                  {activeOrder.address.label && (
                    <div>{activeOrder.address.label}</div>
                  )}
                  {activeOrder.address.street && (
                    <div>{activeOrder.address.street}</div>
                  )}

                  {(activeOrder.address.city || activeOrder.address.state) && (
                    <div>
                      {activeOrder.address.city} - {activeOrder.address.state}
                    </div>
                  )}

                  {activeOrder.address.notes && (
                    <div className="mt-1">{activeOrder.address.notes}</div>
                  )}
                </div>
              )}

              <div className="mt-2">
                <div className="text-sm text-gray-300 mb-2">
                  {langOr("الحالة", "Status")}
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  <div
                    className={`px-3 py-1 rounded-full ${
                      activeOrder.status === "delivered"
                        ? "bg-green-600/20 text-green-300"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {activeOrder.status}
                  </div>

                  <div className="px-3 py-1 rounded-full bg-white/5 text-white/40">
                    {t(activeOrder.paymentMethod)}
                  </div>
                </div>

                <div className="flex gap-2">
                  {activeOrder.status !== "cancelled" &&
                    activeOrder.status !== "delivered" && (
                      <button
                        onClick={() => cancelOrder(activeOrder)}
                        disabled={loadingAction}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/25"
                      >
                        {loadingAction ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaTimesCircle /> إلغاء الطلب
                          </>
                        )}
                      </button>
                    )}

                  <button
                    onClick={() => {
                      copyToClipboard(
                        JSON.stringify(activeOrder),
                        "تم نسخ بيانات الطلب"
                      );
                    }}
                    className="px-3 py-2 rounded-lg bg-white/6"
                  >
                    نسخ JSON
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => printInvoice(activeOrder)}
                    className="px-3 py-2 rounded-lg bg-cyan-500 text-white flex items-center gap-2"
                  >
                    <FaPrint /> طباعة
                  </button>

                  <button
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(activeOrder, null, 2)],
                        { type: "application/json" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `order-${activeOrder.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/6 flex items-center gap-2"
                  >
                    <FaFileDownload /> تحميل JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
