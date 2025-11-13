"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ar");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ تحقق من حالة تسجيل الدخول عند فتح الصفحة
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/account");
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // ✅ تنفيذ تسجيل الدخول
  const handleLogin = async () => {
    setError("");

    if (!form.email || !form.password) {
      return setError(lang === "ar" ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
    }

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/account");
    } catch (err) {
      console.error("Login error:", err);

      // 🧠 عرض الأخطاء بدقة بلغتين
      let message = "";
      switch (err.code) {
        case "auth/invalid-email":
          message = lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
          break;
        case "auth/user-not-found":
          message = lang === "ar" ? "المستخدم غير موجود" : "User not found";
          break;
        case "auth/wrong-password":
          message = lang === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password";
          break;
        case "auth/too-many-requests":
          message =
            lang === "ar"
              ? "تم تعطيل الحساب مؤقتًا بسبب محاولات فاشلة كثيرة، حاول لاحقًا"
              : "Account temporarily disabled due to too many failed attempts";
          break;
        case "auth/network-request-failed":
          message = lang === "ar" ? "تحقق من اتصال الإنترنت" : "Network error, check your connection";
          break;
        default:
          message = lang === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred while logging in";
      }

      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#050a25] text-white text-xl font-[Cairo]">
        {lang === "ar" ? "جار التحقق من الحساب..." : "Checking account..."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050a25] via-[#081648] to-[#0b245c] text-white font-[Cairo] pb-16">
      <Navbar
        lang={lang}
        setLang={setLang}
        cart={[]}
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
      />

      <div className="max-w-md mx-auto px-4 py-20">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-10"
        >
          {lang === "ar" ? "تسجيل الدخول" : "Login"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl"
        >
          {/* ✅ عرض الخطأ */}
          {error && <p className="text-red-500 font-semibold text-center">{error}</p>}

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/20">
            <FaEnvelope className="text-gray-300" />
            <input
              type="email"
              placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-transparent focus:outline-none w-full text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/20">
            <FaLock className="text-gray-300" />
            <input
              type="password"
              placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-transparent focus:outline-none w-full text-white placeholder:text-gray-400"
            />
          </div>

          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.05 }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold shadow-md hover:shadow-cyan-500/30 transition"
          >
            {lang === "ar" ? "تسجيل الدخول" : "Login"}
          </motion.button>

          <p className="text-gray-400 text-sm text-center mt-2">
            {lang === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
            <span
              onClick={() => router.push("/signup")}
              className="text-cyan-400 font-semibold cursor-pointer hover:underline"
            >
              {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
            </span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
