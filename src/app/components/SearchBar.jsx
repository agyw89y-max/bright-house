"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebase";

export default function SearchBar({ className = "" }) {
  const router = useRouter();
  const [lang, setLang] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("bh_lang") || "ar" : "ar"
  );

  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // 🔥 جلب المنتجات من Firebase
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const snap = await get(ref(db, "products"));
        const val = snap.exists() ? snap.val() : [];
        const arr = Array.isArray(val) ? val : Object.values(val || {});
        if (mounted) setProducts(arr);
      } catch (err) {
        console.error("SearchBar fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // 🔄 تحديث اللغة في الوقت الفعلي
  useEffect(() => {
    function onStorage() {
      const l = localStorage.getItem("bh_lang") || "ar";
      setLang(l);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 💡 اقتراحات البحث (Debounce + فلترة)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const term = q.trim().toLowerCase();
      const res = products
        .filter((p) => {
          const nameAr = (p.name?.ar || "").toLowerCase();
          const nameEn = (p.name?.en || "").toLowerCase();
          const catAr = (p.categoryName?.ar || "").toLowerCase();
          const catEn = (p.categoryName?.en || "").toLowerCase();
          return (
            nameAr.includes(term) ||
            nameEn.includes(term) ||
            catAr.includes(term) ||
            catEn.includes(term)
          );
        })
        .slice(0, 8);
      setSuggestions(res);
      setOpen(res.length > 0);
    }, 180);

    return () => clearTimeout(debounceRef.current);
  }, [q, products]);

  function onKeyDown(e) {
    if (e.key === "Enter") {
      const query = q.trim();
      if (query) {
        setOpen(false);
        router.push(`/search?query=${encodeURIComponent(query)}`);
      }
    }
    if (e.key === "Escape") setOpen(false);
  }

  // إغلاق عند النقر بالخارج
  useEffect(() => {
    function handleClick(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isFocused = open || q.length > 0;

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* 🔥 Overlay عند فتح الاقتراحات */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* 🔍 صندوق البحث */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        animate={
          isFocused
            ? { boxShadow: "0 0 25px rgba(0,255,255,0.6)" }
            : { boxShadow: "0 0 15px rgba(0,255,255,0.2)" }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex items-center bg-gradient-to-r from-cyan-500/20 via-blue-600/10 to-cyan-500/20 p-[2px] rounded-full"
      >
        <input
          ref={inputRef}
          value={q}
          dir={lang === "ar" ? "rtl" : "ltr"}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder={lang === "ar" ? "ابحث عن منتج..." : "Search products..."}
          className="w-full py-3 px-5 rounded-full bg-[#0b1628]/80 backdrop-blur-xl text-white placeholder-gray-400 focus:outline-none"
        />

        {/* ✨ أيقونة البحث مع تأثير Sparkle */}
        <motion.button
          onClick={() => q && router.push(`/search?query=${encodeURIComponent(q)}`)}
          animate={q ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute right-5 text-cyan-400 hover:text-white transition relative"
        >
          <FaSearch size={18} />
          {q && (
            <motion.span
              key="spark"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_12px_rgba(0,255,255,0.8)]"
            />
          )}
        </motion.button>
      </motion.div>

      {/* 💫 قائمة الاقتراحات */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute mt-3 left-0 right-0 
                       bg-gradient-to-b from-[#0a1424]/[0.98] via-[#0a1424]/[0.95] to-[#000814]/[0.97] 
                       backdrop-blur-2xl 
                       border border-cyan-400/20 
                       rounded-2xl 
                       shadow-[0_0_25px_rgba(0,255,255,0.15),inset_0_0_12px_rgba(255,255,255,0.04)] 
                       max-h-80 overflow-auto z-50"
          >
            {suggestions.map((s) => (
              <motion.li
                key={s.id}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(0,255,255,0.08)",
                  boxShadow: "0 0 10px rgba(0,255,255,0.15)",
                }}
                transition={{ duration: 0.15 }}
                onClick={() => router.push(`/product/${s.id}`)}
                className="flex items-center gap-4 p-3 border-b border-white/5 cursor-pointer"
              >
              <img
  src={
    s.image && s.image.trim() !== ""
      ? s.image
      : s.images?.[0] ||
        "https://res.cloudinary.com/demo/image/upload/v1690000000/placeholder.jpg"
  }
  alt={s.name?.[lang] || "Product"}
  className="w-12 h-12 rounded-lg object-cover shadow-md bg-white/10"
/>

                <div className="flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {s.name?.[lang]}
                  </div>
                  <div className="text-xs text-cyan-300">EGP {s.price}</div>
                </div>
              </motion.li>
            ))}
            <li className="p-3 text-center border-t border-white/10">
              <button
                onClick={() => {
                  router.push(`/search?query=${encodeURIComponent(q)}`);
                  setOpen(false);
                }}
                className="text-sm text-cyan-400 hover:underline"
              >
                {lang === "ar"
                  ? `عرض كل النتائج عن "${q}"`
                  : `See all results for "${q}"`}
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
