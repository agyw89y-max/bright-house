"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ar");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ التحقق من حالة المستخدم (هل مسجل دخول مسبقًا)
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

  // ✅ تسجيل الحساب
  const handleSubmit = async () => {
    setError("");

    // التحقق من صحة البيانات
    if (!form.name || !form.email || !form.phone || !form.password) {
      return setError(lang === "ar" ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return setError(lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email");
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(form.phone)) {
      return setError(lang === "ar" ? "رقم الهاتف غير صالح" : "Invalid phone number");
    }

    if (form.password.length < 6) {
      return setError(lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: form.name });
      router.push("/account");
    } catch (err) {
      console.error("Signup error:", err);

      // ✅ تحديد نوع الخطأ وعرضه بلغتين
      let message = "";
      switch (err.code) {
        case "auth/email-already-in-use":
          message = lang === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email already in use";
          break;
        case "auth/invalid-email":
          message = lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
          break;
        case "auth/weak-password":
          message = lang === "ar" ? "كلمة المرور ضعيفة جدًا" : "Weak password";
          break;
        case "auth/network-request-failed":
          message = lang === "ar" ? "تحقق من اتصال الإنترنت" : "Network error. Please check your connection.";
          break;
        default:
          message = lang === "ar" ? "حدث خطأ أثناء إنشاء الحساب" : "An error occurred while creating your account";
      }
      setError(message);
    }
  };

  // شاشة التحميل أثناء التحقق من الحساب
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
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
        cart={[]}
        user={null}
        onLogout={() => {}}
      />

      <div className="max-w-md mx-auto px-4 py-20">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-10"
        >
          {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl"
        >
          {/* ✅ عرض رسالة الخطأ */}
          {error && <p className="text-red-500 font-semibold text-center">{error}</p>}

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/20">
            <FaUser className="text-gray-300" />
            <input
              type="text"
              placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-transparent focus:outline-none w-full text-white placeholder:text-gray-400"
            />
          </div>

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
            <FaPhone className="text-gray-300" />
            <input
              type="tel"
              placeholder={lang === "ar" ? "رقم الهاتف" : "Phone Number"}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold shadow-md hover:shadow-cyan-500/30 transition"
          >
            {lang === "ar" ? "إنشاء الحساب" : "Create Account"}
          </motion.button>

          <p className="text-gray-400 text-sm text-center mt-2">
            {lang === "ar" ? "لديك حساب بالفعل؟ " : "Already have an account? "}
            <span
              onClick={() => router.push("/login")}
              className="text-cyan-400 font-semibold cursor-pointer hover:underline"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Login"}
            </span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

