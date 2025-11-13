"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebase";

import Navbar from "../components/Navbar";

// TF-IDF simple score
function relevanceScore(p, query) {
  if (!query) return 0;
  const q = query.toLowerCase().split(/\s+/);
  let score = 0;
  q.forEach((word) => {
    const name = (p.name?.ar || p.name?.en || "").toLowerCase();
    const desc = (p.shortDescription?.ar || p.shortDescription?.en || "").toLowerCase();
    if (name.includes(word)) score += 2;
    if (desc.includes(word)) score += 1;
  });
  return score;
}

function formatPrice(v) {
  if (v == null) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString("en-US");
}

// Product Card
function ProductCard({ p, lang, onAdd }) {
  const title = p.name?.[lang] || p.name?.en || Object.values(p.name || {})[0] || "Product";
  const short = p.shortDescription?.[lang] || p.shortDescription?.en || "";
  const price = p.price || 0;

  return (
    <motion.article
      whileHover={{ y: -5, boxShadow: "0px 15px 25px rgba(0,0,0,0.5)" }}
      layout
      className="card-glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-md transition-all duration-300"
      aria-label={title}
      role="article"
    >
      <a href={`/product/${p.id}`} className="flex-shrink-0 relative w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-white/5">
        <img
       src={p.images?.[0] || "/placeholder.png"}

          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </a>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold truncate text-lg">{title}</h3>
          <p className="text-sm text-gray-300 truncate mt-1">{short}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold">EGP {formatPrice(price)}</span>
            {p.oldPrice && <span className="line-through text-gray-400 text-sm">EGP {formatPrice(p.oldPrice)}</span>}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onAdd(p)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              {lang === "ar" ? "أضف" : "Add"}
            </motion.button>
            <a href={`/product/${p.id}`} className="text-sm text-gray-300 hover:underline">
              {lang === "ar" ? "تفاصيل" : "Details"}
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Skeleton Loader
function SkeletonCard() {
  return (
    <div className="card-glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start animate-pulse">
      <div className="w-full sm:w-28 h-28 rounded-lg bg-white/6" />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded bg-white/6 w-3/4" />
        <div className="h-3 rounded bg-white/6 w-2/3" />
        <div className="h-4 rounded bg-white/6 w-1/4 mt-2" />
      </div>
    </div>
  );
}

// Main Search Page
export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("query") || "").trim();

  const [lang, setLang] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("bh_lang") || "ar" : "ar"));
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [sort, setSort] = useState("relevance");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        setLoading(true);
        const snap = await get(ref(db, "products"));
        const val = snap.exists() ? snap.val() : [];
        const arr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val || {});
        if (!mounted) return;
        setAllProducts(arr);
      } catch (err) {
        console.error(err);
        setAllProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProducts();

    const savedCart = typeof window !== "undefined" ? localStorage.getItem("bh_cart") : null;
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) || []);
      } catch {
        setCart([]);
      }
    }

    const savedLang = typeof window !== "undefined" ? localStorage.getItem("bh_lang") : null;
    if (savedLang) setLang(savedLang);

    return () => { mounted = false; };
  }, [q]);

  const categories = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      const cn = p.categoryName?.[lang] || "Uncategorized";
      set.add(cn);
    });
    return ["all", ...Array.from(set)];
  }, [allProducts, lang]);

  useEffect(() => {
    let filtered = allProducts.filter(Boolean);

    if (q) filtered = filtered.filter((p) => relevanceScore(p, q) > 0);

    if (category && category !== "all") {
      filtered = filtered.filter((p) => {
        const cat = p.categoryName?.[lang] || "";
        return cat === category;
      });
    }

    filtered = filtered.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (sort === "price-asc") filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc") filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else filtered.sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q));

    setResults(filtered);
    setVisibleCount(12);
  }, [allProducts, q, category, sort, priceRange, lang]);

  function addToCart(p) {
    const existing = cart.find((c) => c.id === p.id);
    let updated;
    if (existing) updated = cart.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else updated = [...cart, { ...p, qty: 1 }];
    setCart(updated);
    localStorage.setItem("bh_cart", JSON.stringify(updated));
    toast.success(
      <div className="flex items-center gap-2">
        <span>{p.name?.[lang] || p.name?.en || "Item"}</span>
        <span className="font-bold">{lang === "ar" ? "أضيفت للعربة" : "added to cart"}</span>
      </div>
    );
  }

  function clearFilters() {
    setCategory("all");
    setSort("relevance");
    setPriceRange([0, 100000]);
  }

  const visibleResults = useMemo(() => results.slice(0, visibleCount), [results, visibleCount]);

  return (
    <>
      <Toaster position="top-right" />
    

<Navbar
  lang={lang}
  setLang={setLang}
   cart={cart}  // <- بدل items
  onToggleLang={() => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("bh_lang", newLang);
  }}
/>


      <main className="min-h-screen bg-gradient-to-br from-[#03061a] via-[#041029] to-[#061025] text-white pb-24 pt-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-full bg-white/6 text-sm">
              <option value="relevance">{lang === "ar" ? "الأقرب" : "Relevance"}</option>
              <option value="price-asc">{lang === "ar" ? "الأرخص أولاً" : "Price: low → high"}</option>
              <option value="price-desc">{lang === "ar" ? "الأغلى أولاً" : "Price: high → low"}</option>
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-full bg-white/6 text-sm">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">{lang === "ar" ? "السعر:" : "Price:"}</label>
              <input
                type="range"
                min={0}
                max={10000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-32"
              />
              <span className="text-sm text-gray-300">{priceRange[0]}-{priceRange[1]}</span>
            </div>

            <button onClick={clearFilters} className="px-3 py-2 rounded-full bg-white/6 text-sm">{lang === "ar" ? "مسح" : "Clear"}</button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl p-8 bg-white/3 text-center">
              <h3 className="text-xl font-semibold mb-2">{lang === "ar" ? "عفواً — لا توجد نتائج" : "Sorry — no results"}</h3>
              <p className="text-gray-300">{lang === "ar" ? "حاول تعديل كلمة البحث أو تصفح التصنيفات." : "Try adjusting your search or browse categories."}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence initial={false}>
                  {visibleResults.map((p) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <ProductCard p={p} lang={lang} onAdd={addToCart} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">{lang === "ar" ? `${visibleResults.length} من ${results.length}` : `${visibleResults.length} of ${results.length}`}</div>

                {visibleCount < results.length && (
                  <button onClick={() => setVisibleCount((s) => s + 12)} className="px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 transition-colors">{lang === "ar" ? "تحميل المزيد" : "Load more"}</button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
