"use client";

import React, { useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import { ref, onValue } from "firebase/database";

import { db } from "../../firebase/firebase";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const MemoizedProductCard = memo(ProductCard);

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
  const [sortOrder, setSortOrder] = useState("asc");
const [user, setUser] = useState(null);

  // Mounted & LocalStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("bh_lang") || "ar";
    setLang(savedLang);

    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    setMounted(true);
  }, []);

// ✅ تتبع حالة المستخدم من Firebase أو localStorage
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem("bh_user", JSON.stringify(currentUser));
    } else {
      const savedUser = localStorage.getItem("bh_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    }
  });

  return () => unsubscribe();
}, []);



  useEffect(() => {
    if (mounted) localStorage.setItem("bh_lang", lang);
  }, [lang, mounted]);

  // Fetch category & products
 useEffect(() => {
  if (!mounted) return;

  setLoading(true);
  const catsRef = ref(db, "categories");
  const prodsRef = ref(db, "products");

  const unsubCats = onValue(catsRef, (catsSnap) => {
    const catsArr = catsSnap.exists() ? Object.values(catsSnap.val()) : [];
    const cat = catsArr.find((c) => c.id === category);

    setCategoryData(
      cat || {
        name: { ar: "قسم", en: "Category" },
        description: {
          ar: "استعرض منتجات هذا القسم.",
          en: "Browse products in this category.",
        },
      }
    );
  });

  const unsubProds = onValue(prodsRef, (prodsSnap) => {
    const prodsArr = prodsSnap.exists() ? Object.values(prodsSnap.val()) : [];

    const filtered = prodsArr
      .filter((p) => p.categoryId === category)
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // ✅ الترتيب من Firebase

    setProducts(filtered);

    const highestPrice = filtered.reduce(
      (max, p) => Math.max(max, p.price || 0),
      0
    );

    setMaxPrice(highestPrice);
 if (price === 0) setPrice(highestPrice);

    setLoading(false);
  });

  return () => {
    unsubCats();
    unsubProds();
  };
}, [category, mounted]);













  const addToCart = (product) => {
    const exists = cart.find(c => c.id === product.id);
    const updatedCart = exists
      ? cart.map(c => c.id === product.id ? { ...c, qty: Math.min(c.qty + 1, product.stock || 99) } : c)
      : [...cart, { ...product, qty: 1 }];

    setCart(updatedCart);
    localStorage.setItem("bh_cart", JSON.stringify(updatedCart));

    // Toast مع أنيميشن نبضي
    toast.custom(
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
      >
        <span>{product.name?.[lang] || product.name}</span>
        <strong>{lang === "ar" ? "أضيفت للعربة" : "added to cart"}</strong>
      </motion.div>,
      { duration: 2000 }
    );
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  // Filtered & Sorted products
const filteredProducts = products
  .filter(p => (p.price || 0) <= price); // فلتر حسب السعر

// إذا المستخدم ما اختارش فرز (sortOrder = "order") نستخدم ترتيب الـ order من Firebase
   const displayedProducts = [...filteredProducts].sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;

  // القيمة الافتراضية: ترتيب حسب order
  return (a.order || 0) - (b.order || 0);
});


  return (
    <main className="min-h-screen bg-gradient-to-br from-[#03061a] via-[#041029] to-[#061025] text-white pb-24 relative overflow-hidden">
      <Toaster />

      {/* Dynamic Stars Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: Math.random() * 3 + 2 }}
          />
        ))}
      </motion.div>

      {/* Navbar */}
    <Navbar
  lang={lang}
  onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
  cart={cart}
  user={user}
/>

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold mb-2"
        >
          {categoryData?.name?.[lang] || categoryData?.name?.ar || "قسم"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-400"
        >
          {categoryData?.description?.[lang] || categoryData?.description?.ar || "استعرض منتجات هذا القسم."}
        </motion.p>
      </section>
{/* Price Slider & Sort */}
<section className="max-w-7xl mx-auto px-4 mt-6 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div className="flex-1 flex flex-col gap-2">
    <label className="text-gray-300">
      {lang === "ar" ? "أقصى سعر:" : "Max Price:"} {price} EGP
    </label>
    <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-lg"
        style={{ width: `${(price / (maxPrice || 1000)) * 100}%` }}
        animate={{ width: `${(price / (maxPrice || 1000)) * 100}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
      <input
        type="range"
        min={0}
        max={maxPrice || 1000}
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        className="absolute top-0 left-0 w-full h-4 bg-transparent appearance-none cursor-pointer"
      />
      {/* Bubble */}
      <motion.div
        className="absolute -top-8 px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-lg"
        style={{ left: `${(price / (maxPrice || 1000)) * 100}%`, translateX: "-50%" }}
        animate={{ scale: [0.8, 1.1, 1], y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {price} EGP
      </motion.div>
    </div>
  </div>

  {/* Dropdown ترتيب السعر */}
  <div className="flex-shrink-0">
    <label className="text-gray-300 mr-2">{lang === "ar" ? "ترتيب:" : "Sort:"}</label>
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="bg-white/10 text-white px-3 py-1 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer"
    >
      <option value="order">{lang === "ar" ? "الترتيب الافتراضي" : "Default Order"}</option>
      <option value="asc">{lang === "ar" ? "من الأقل للأعلى" : "Price: Low to High"}</option>
      <option value="desc">{lang === "ar" ? "من الأعلى للأقل" : "Price: High to Low"}</option>
    </select>
  </div>
</section>

{/* Products Grid */}
<section className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
  {loading
    ? Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-full h-64 bg-white/5 rounded-2xl animate-pulse" />
      ))
    : displayedProducts.length === 0
    ? <div className="text-gray-400 col-span-full text-center py-10">
        {lang === "ar" ? "لا توجد منتجات في هذا القسم" : "No products in this category"}
      </div>
    : displayedProducts
        .filter(p => (p.price || 0) <= price)
        .sort((a, b) => {
          if (sortOrder === "asc") return a.price - b.price;
          if (sortOrder === "desc") return b.price - a.price;
          return (a.order || 0) - (b.order || 0); // Default order
        })
        .map((p, idx) => (
          <motion.div
       key={`${p.id}-${idx}`} // إضافة الـ index يجعل كل مفتاح فريد
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 120, damping: 20 }}
            whileHover={{ scale: 1.03 }}
          >
            <MemoizedProductCard p={p} onAdd={addToCart} lang={lang} />
          </motion.div>
        ))
  }
</section>


      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400 py-10 border-t border-white/10 relative z-10">
        <p>
          {lang === "ar"
            ? `© ${new Date().getFullYear()} برايت هاوس. كل الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} Bright House. All rights reserved.`}
        </p>
      </footer>
    </main>
  );
}
