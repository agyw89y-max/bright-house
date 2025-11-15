"use client";

import React, { useEffect, useState, memo, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ref, onValue, get } from "firebase/database";
import { db } from "../../firebase/firebase";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createPortal } from "react-dom";

const MemoizedProductCard = memo(ProductCard);

/**
 * Helper: debounce hook
 */
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * FlyToCart portal element (for the flying dot animation)
 */
function FlyDot({ from, show }) {
  if (!show || !from) return null;
  return createPortal(
    <motion.div
      initial={{ x: from.x, y: from.y, opacity: 1, scale: 1 }}
      animate={{ x: window.innerWidth - 80, y: 40, scale: 0.2, opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      style={{
        position: "fixed",
        width: 24,
        height: 24,
        borderRadius: 12,
        background: "linear-gradient(90deg,#06b6d4,#6366f1)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />,
    document.body
  );
}

export default function CategoryPage() {
  const { category } = useParams();
  const [lang, setLang] = useState("ar");
  const [mounted, setMounted] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortOrder, setSortOrder] = useState("order");
  const [user, setUser] = useState(null);

  // QuickView modal
  const [quick, setQuick] = useState({ open: false, product: null });

  // Fly to cart
  const [flyFrom, setFlyFrom] = useState(null);
  const [flyShow, setFlyShow] = useState(false);

  // Mounted & LocalStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("bh_lang") || "ar";
    setLang(savedLang);

    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedSort = localStorage.getItem("bh_sort") || "order";
    setSortOrder(savedSort);

    setMounted(true);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("bh_user", JSON.stringify(currentUser));
      } else {
        const savedUser = localStorage.getItem("bh_user");
        if (savedUser) setUser(JSON.parse(savedUser));
        else setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("bh_lang", lang);
  }, [lang, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem("bh_sort", sortOrder);
  }, [sortOrder, mounted]);

  // Fetch category & products (real-time)
  useEffect(() => {
    if (!mounted) return;
    setLoading(true);

    const catsRef = ref(db, "categories");
    const prodsRef = ref(db, "products");

    const unsubCats = onValue(catsRef, (catsSnap) => {
      const catsVal = catsSnap.exists() ? catsSnap.val() : {};
      // categories might be keyed by id -> keep original keys
      const cat = Object.keys(catsVal).map(k => ({ id: k, ...(catsVal[k] || {}) })).find(c => c.id === category);
      setCategoryData(
        cat || {
          name: { ar: "قسم", en: "Category" },
          description: { ar: "استعرض منتجات هذا القسم.", en: "Browse products in this category." },
        }
      );
    });

    const unsubProds = onValue(prodsRef, (prodsSnap) => {
      const val = prodsSnap.exists() ? prodsSnap.val() : {};
      const arr = Object.keys(val).map(k => ({ id: k, ...(val[k] || {}) }));
      const filtered = arr.filter((p) => p.categoryId === category);
      // default ordering by order field, fallback to price asc
      filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(filtered);

      const highestPrice = filtered.reduce((m, p) => Math.max(m, p.price || 0), 0);
      setMaxPrice(highestPrice || 1000);
      setPrice(prev => (prev === 0 ? (highestPrice || 100) : prev));
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, [category, mounted]);

  // Debounced price to avoid rapid re-renders
  const debouncedPrice = useDebounced(price, 120);

  // Memoized filtered + sorted products
  const displayedProducts = useMemo(() => {
    const list = products.filter(p => (p.price || 0) <= (debouncedPrice || maxPrice));
    if (sortOrder === "asc") return [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortOrder === "desc") return [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    // default: respect `order` provided by Firebase
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [products, debouncedPrice, maxPrice, sortOrder]);

  // Callback to add to cart with flying dot
  const addToCart = useCallback((product, e) => {
    // compute fly start position from event (if available)
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setFlyFrom({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setFlyShow(true);
      setTimeout(() => setFlyShow(false), 1100);
    } else {
      setFlyFrom({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setFlyShow(true);
      setTimeout(() => setFlyShow(false), 1100);
    }

    setCart(prev => {
      const exists = prev.find(c => c.id === product.id);
      const updated = exists ? prev.map(c => c.id === product.id ? { ...c, qty: Math.min((c.qty || 0) + 1, product.stock || 99) } : c) : [...prev, { ...product, qty: 1 }];
      localStorage.setItem("bh_cart", JSON.stringify(updated));
      return updated;
    });

    // Toast with small product image (if exists)
    toast.success(
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flex: "0 0 40px" }}>
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name?.[lang]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{product.name?.[lang] || product.name}</div>
          <div style={{ fontSize: 12 }}>{lang === "ar" ? "أضيفت للعربة" : "Added to cart"}</div>
        </div>
      </div>,
      { duration: 2200, style: { background: "#071026", color: "#fff" } }
    );
  }, [lang]);

  // Quick view open
  const openQuick = useCallback((p) => setQuick({ open: true, product: p }), []);
  const closeQuick = useCallback(() => setQuick({ open: false, product: null }), []);

  // small accessibility: ensure mounted
  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#03061a] via-[#041029] to-[#061025] text-white pb-24 relative overflow-hidden">
      <Toaster />

      {/* subtle animated background dots */}
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.8 }}>
        {[...Array(30)].map((_, i) => (
          <motion.span key={i} className="absolute bg-white/6 rounded-full" style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }} animate={{ y: [0, Math.random() * 6 - 3, 0] }} transition={{ repeat: Infinity, duration: Math.random() * 6 + 4, delay: Math.random() * 3 }} />
        ))}
      </motion.div>

      <Navbar lang={lang} onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")} cart={cart} user={user} />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl md:text-5xl font-extrabold mb-2">
          {categoryData?.name?.[lang] || categoryData?.name?.ar || "قسم"}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-400 max-w-2xl">
          {categoryData?.description?.[lang] || categoryData?.description?.ar || "استعرض منتجات هذا القسم."}
        </motion.p>
      </section>

      {/* Controls + Sidebar (responsive) */}
      <section className="max-w-7xl mx-auto px-4 mt-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 sticky top-24 self-start hidden lg:block">
          <div className="bg-white/4 border border-white/6 rounded-2xl p-4 backdrop-blur-md">
            <h3 className="font-semibold mb-2">{lang === "ar" ? "الفلاتر" : "Filters"}</h3>

            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-1">{lang === "ar" ? "أعلى سعر" : "Max price"}</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={maxPrice || 1000} value={price} onChange={e => setPrice(+e.target.value)} className="w-full" />
                <div className="text-sm font-semibold">{price} EGP</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-1">{lang === "ar" ? "الترتيب" : "Sort"}</label>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-2 rounded-md bg-white/6">
                <option value="order">{lang === "ar" ? "الترتيب الافتراضي" : "Default order"}</option>
                <option value="asc">{lang === "ar" ? "السعر: من الأقل" : "Price: low to high"}</option>
                <option value="desc">{lang === "ar" ? "السعر: من الأعلى" : "Price: high to low"}</option>
              </select>
            </div>

            <button onClick={() => { setPrice(maxPrice); setSortOrder("order"); }} className="w-full text-sm py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
              {lang === "ar" ? "إعادة تعيين" : "Reset"}
            </button>
          </div>

          {/* Small promo / category image */}
          <div className="mt-4">
            <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
              {categoryData?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={categoryData.image} alt={categoryData?.name?.[lang]} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-gray-300">—</div>
              )}
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div className="lg:col-span-9">
          {/* Top controls (mobile) */}
          <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-300">{lang === "ar" ? "أعلى سعر:" : "Max:"}</div>
              <div className="font-semibold">{price} EGP</div>
            </div>

            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-white/6 p-2 rounded-md">
              <option value="order">{lang === "ar" ? "الترتيب الافتراضي" : "Default"}</option>
              <option value="asc">{lang === "ar" ? "الأرخص أولاً" : "Low → High"}</option>
              <option value="desc">{lang === "ar" ? "الأغلى أولاً" : "High → Low"}</option>
            </select>
          </div>

          {/* Products area */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-full h-64 bg-white/5 rounded-2xl animate-pulse" />
                ))
              : displayedProducts.length === 0
              ? <div className="text-gray-400 col-span-full text-center py-16">{lang === "ar" ? "لا توجد منتجات في هذا القسم" : "No products"}</div>
              : displayedProducts.map((p, idx) => (
                  <motion.div key={`${p.id}-${idx}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} whileHover={{ y: -6 }}>
                    <MemoizedProductCard
                      p={p}
                      onAdd={(prod, e) => addToCart(prod, e)}
                      onQuickView={() => openQuick(p)}
                      lang={lang}
                    />
                  </motion.div>
                ))
            }
          </section>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400 py-10 border-t border-white/10 relative z-10">
        <p>{lang === "ar" ? `© ${new Date().getFullYear()} برايت هاوس. كل الحقوق محفوظة.` : `© ${new Date().getFullYear()} Bright House. All rights reserved.`}</p>
      </footer>

      {/* Fly dot */}
      <FlyDot from={flyFrom} show={flyShow} />

      {/* Quick View modal */}
      <AnimatePresence>
        {quick.open && quick.product && createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div onClick={closeQuick} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }} className="relative w-full max-w-3xl bg-[#071028] border border-white/8 rounded-2xl p-6 z-10">
              <div className="flex gap-4">
                <div className="w-1/2 h-64 rounded-xl overflow-hidden bg-white/3">
                  {quick.product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={quick.product.images[0]} alt={quick.product.name?.[lang]} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-400">—</div>}
                </div>
                <div className="w-1/2">
                  <h3 className="text-xl font-bold">{quick.product.name?.[lang]}</h3>
                  <p className="text-gray-300 mt-2 line-clamp-3">{quick.product.shortDescription?.[lang] || quick.product.shortDescription?.ar || quick.product.shortDescription?.en}</p>
                  <div className="mt-4 font-extrabold text-cyan-400 text-2xl">EGP {quick.product.price}</div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={(e) => { addToCart(quick.product, e); closeQuick(); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600">
                      {lang === "ar" ? "أضف للعربة" : "Add to cart"}
                    </button>
                    <button onClick={closeQuick} className="px-4 py-2 rounded-lg bg-white/6">
                      {lang === "ar" ? "إغلاق" : "Close"}
                    </button>
                  </div>
                </div>
              </div>
              <button aria-label="close" onClick={closeQuick} className="absolute top-4 right-4 text-gray-300">✕</button>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Inline styles (you can move to global/tailwind) */}
      <style>{`
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  );
}   


