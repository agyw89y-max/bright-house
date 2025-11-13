"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [totalPulse, setTotalPulse] = useState(false);
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    const savedLang = localStorage.getItem("bh_lang");
    if (savedLang) setLang(savedLang);

    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) setItems(JSON.parse(savedCart) || []);
  }, []);

  useEffect(() => {
    const syncLang = (e) => {
      if (e.key === "bh_lang") setLang(e.newValue || "ar");
    };
    window.addEventListener("storage", syncLang);
    return () => window.removeEventListener("storage", syncLang);
  }, []);

  const updateQty = (id, delta) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta), pulse: true }
          : item
      );
      localStorage.setItem("bh_cart", JSON.stringify(updated));
      return updated;
    });

    setTotalPulse(true);
    setTimeout(() => setTotalPulse(false), 400);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, pulse: false } : item))
      );
    }, 400);
  };

  const removeItem = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("bh_cart", JSON.stringify(updated));
  };

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );
const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("bh_user");
  return savedUser ? JSON.parse(savedUser) : null;
});
useEffect(() => {
  const syncUser = (e) => {
    if (e.key === "bh_user") {
      const newUser = e.newValue ? JSON.parse(e.newValue) : null;
      setUser(newUser);
    }
  };
  window.addEventListener("storage", syncUser);
  return () => window.removeEventListener("storage", syncUser);
}, []);


  return (
    <main className="relative min-h-screen overflow-hidden text-white font-[Cairo] selection:bg-cyan-400/30">
      {/* الهيدر */}
<Navbar
  lang={lang}
  setLang={setLang}
  cart={items}
  user={user}
  onToggleLang={() => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("bh_lang", newLang);
  }}
/>



      {/* الخلفية */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a25] via-[#081648] to-[#0b245c] bg-[length:300%_300%] animate-gradientMove"></div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-10">
        {/* Header العربة */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-6xl flex justify-between items-center backdrop-blur-2xl bg-white/10 p-4 rounded-2xl shadow-lg border border-white/10"
        >
          <Link
            href="/sales"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <FaArrowLeft /> {lang === "ar" ? "متابعة التسوق" : "Continue Shopping"}
          </Link>
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
            🛒 {lang === "ar" ? "سلة المشتريات" : "Shopping Cart"}
          </h1>
          <div className="text-gray-400 text-sm">
            {items.length}{" "}
            {lang === "ar"
              ? items.length === 1
                ? "منتج"
                : "منتجات"
              : items.length === 1
              ? "item"
              : "items"}
          </div>
        </motion.header>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-32 text-center text-gray-300"
          >
            <p className="text-xl">{lang === "ar" ? "😅 العربة فارغة" : "😅 Your cart is empty"}</p>
            <Link
              href="/sales"
              className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold shadow-md hover:shadow-cyan-500/30 transition-all"
            >
              {lang === "ar" ? "تسوّق الآن" : "Shop Now"}
            </Link>
          </motion.div>
        ) : (
          <div className="w-full max-w-6xl mt-10 grid md:grid-cols-3 gap-8">
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2 space-y-6"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/10 hover:shadow-cyan-500/10 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <Link
                    href={`/product/${item.id}`}
                    className="flex flex-col sm:flex-row items-center sm:items-start gap-3 flex-1 hover:opacity-90 transition"
                  >
<Image
  src={
    item.image && item.image.trim() !== ""
      ? item.image
      : item.images?.[0] || "https://res.cloudinary.com/demo/image/upload/v1690000000/placeholder.jpg"
  }
  alt={lang === "ar" ? item.name?.ar : item.name?.en || "Product"}
  width={90}
  height={90}
  className="rounded-xl bg-white/20 p-2 shadow-inner object-cover"
/>

                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold leading-tight">
                        {lang === "ar" ? item.name?.ar : item.name?.en}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {lang === "ar" ? "السعر" : "Price"}:{" "}
                        <span className="text-cyan-400 font-medium">
                          {item.price.toLocaleString()} {lang === "ar" ? "جنيه" : "EGP"}
                        </span>
                      </p>
                    </div>
                  </Link>

                  {/* Quantity */}
                  <div className="flex justify-center sm:justify-start items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      <FaMinus />
                    </button>
                    <motion.span
                      key={item.quantity}
                      animate={
                        item.pulse
                          ? { scale: [1, 1.3, 1], color: ["#22d3ee", "#3b82f6", "#22d3ee"] }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                      className="w-6 text-center text-lg"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {/* Total + Remove */}
                  <div className="flex justify-between items-center sm:flex-col sm:items-end sm:gap-2 mt-2 sm:mt-0">
                    <p className="font-semibold text-cyan-400 text-lg">
                      {(item.price * item.quantity).toLocaleString()} {lang === "ar" ? "جنيه" : "EGP"}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-500 transition text-xl"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                💰 {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h2>

              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>{lang === "ar" ? "إجمالي المنتجات" : "Subtotal"}</span>
                  <span>
                    {subtotal.toLocaleString()} {lang === "ar" ? "جنيه" : "EGP"}
                  </span>
                </div>
                <hr className="border-white/20 my-2" />
                <div className="flex justify-between text-lg font-semibold text-white">
                  <span>{lang === "ar" ? "الإجمالي الكلي" : "Total"}</span>
                  <motion.span
                    animate={
                      totalPulse
                        ? { scale: [1, 1.2, 1], color: ["#22d3ee", "#3b82f6", "#22d3ee"] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                    className="font-bold"
                  >
                    {subtotal.toLocaleString()} {lang === "ar" ? "جنيه" : "EGP"}
                  </motion.span>
                </div>
              </div>

              <Link href="/checkout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold shadow-md hover:shadow-cyan-500/30 transition"
                >
                  {lang === "ar" ? "الانتقال للدفع 💳" : "Proceed to Checkout 💳"}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradientMove {
          animation: gradientMove 15s ease infinite;
        }
      `}</style>
    </main>
  );
}    