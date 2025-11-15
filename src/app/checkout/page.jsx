"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaCreditCard,
  FaMoneyBillWave,
  FaSave,
} from "react-icons/fa";
import { db, auth } from "../firebase/firebase";
import { ref, get, push, set } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

/**
 * 🌟 Checkout Page (Ultimate Pro)
 * - Prefills address if saved in user profile.
 * - Allows saving updated address.
 * - Simulated card payment.
 * - Clean modern UI.
 */

export default function CheckoutPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ar");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [personal, setPersonal] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ street: "", city: "", state: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [savingAddress, setSavingAddress] = useState(false);
const [showModal, setShowModal] = useState(false);

  // Load initial data
  useEffect(() => {
    const savedLang = localStorage.getItem("bh_lang");
    if (savedLang) setLang(savedLang);

    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }

    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setPersonal((p) => ({
          ...p,
          email: u.email || p.email,
          name: u.displayName || p.name,
        }));

        // ✅ Load saved address from Firebase
        const addrRef = ref(db, `users/${u.uid}/address`);
        const snap = await get(addrRef);
        if (snap.exists()) {
          setAddress(snap.val());
        }
      }
    });

    return () => unsub();
  }, []);

  // Sync cart/lang across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "bh_cart") {
        try {
          setCart(JSON.parse(e.newValue || "[]"));
        } catch {
          setCart([]);
        }
      }
      if (e.key === "bh_lang") setLang(e.newValue || "ar");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, it) =>
          s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [cart]
  );
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);

  // Coupon
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return toast.error(lang === "ar" ? "ادخل كود الخصم" : "Enter coupon code");

    if (code === "BH10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success(lang === "ar" ? "تم تطبيق خصم 10%" : "10% discount applied");
    } else {
      setDiscount(0);
      toast.error(lang === "ar" ? "كود غير صالح" : "Invalid coupon");
    }
  };

  // Save address for logged-in users
  const handleSaveAddress = async () => {
    const user = auth.currentUser;
    if (!user) return toast.error(lang === "ar" ? "سجّل الدخول أولاً" : "Login first");
    if (!address.street || !address.city || !address.state)
      return toast.error(lang === "ar" ? "اكمل بيانات العنوان" : "Complete address");

    setSavingAddress(true);
    try {
      await set(ref(db, `users/${user.uid}/address`), address);
      toast.success(lang === "ar" ? "تم حفظ العنوان بنجاح" : "Address saved");
    } catch {
      toast.error(lang === "ar" ? "فشل حفظ العنوان" : "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!personal.name || !personal.email || !personal.phone)
      return toast.error(lang === "ar" ? "الرجاء ملء بياناتك" : "Please fill personal info");
    if (!validateEmail(personal.email))
      return toast.error(lang === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email");
    if (!validatePhone(personal.phone))
      return toast.error(lang === "ar" ? "رقم هاتف غير صالح" : "Invalid phone");
    if (!address.street || !address.city || !address.state)
      return toast.error(lang === "ar" ? "اكمل بيانات العنوان" : "Complete address");
    if (!cart.length)
      return toast.error(lang === "ar" ? "السلة فارغة" : "Cart is empty");

    setLoading(true);

    const orderData = {
      personal,
      address,
      paymentMethod,
      cart,
      totals: { subtotal, discount, total },
      coupon: coupon || null,
      createdAt: new Date().toISOString(),
      status: "processing",
    };

try {
  const ordersRef = ref(db, "orders");
  const pushed = await push(ordersRef, orderData);

  const currentUser = auth.currentUser;
  if (currentUser) {
    await push(ref(db, `users/${currentUser.uid}/orders`), {
      ...orderData,
      id: pushed.key,
    });
  }

  localStorage.removeItem("bh_cart");
  setCart([]);
  setOrderId(pushed.key);

  // ✅ أهم خطـوة (تشغيل الرسالة)
  setShowModal(true);

  toast.success(lang === "ar" ? "تم إرسال طلبك" : "Order placed");

} catch (err) {
  console.error(err);
  toast.error(lang === "ar" ? "حدث خطأ، حاول مرة اخرى" : "Something went wrong");
} finally {
  setLoading(false);
}
}

























  return (
   
   <main className="min-h-screen bg-gradient-to-br from-[#041029] to-[#000814] text-gray-100 font-[Cairo] pb-20">
















{/* 🌟 Ultra Pro Order Success Modal */}
{showModal && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 12 }}
      className="relative bg-gradient-to-br from-[#0e213a] to-[#071524] p-10 rounded-3xl shadow-[0_0_40px_rgba(0,255,255,0.15)] border border-cyan-400/20 text-center w-[92%] max-w-md overflow-hidden"
    >

      {/* ✨ خلفية مؤثرات */}
      <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-cover bg-center pointer-events-none"></div>

      {/* ✔ Icon */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring" }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-500/25 flex items-center justify-center border border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
      >
        <FaCheckCircle className="text-cyan-300 text-6xl drop-shadow-[0_0_10px_rgb(0,255,255)]" />
      </motion.div>

      {/* العنوان */}
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-cyan-200 mb-3"
      >
        {lang === "ar" ? "تم تسجيل طلبك!" : "Order Registered!"}
      </motion.h2>

      {/* الرسالة */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-gray-300 text-lg leading-relaxed mb-6"
      >
        {lang === "ar"
          ? "جارٍ تجهيز طلبك… وسيتم التواصل معك لتأكيد طلبك قريبًا. شكرًا لثقتك بنا!"
          : "Your order is being processed… We will contact you soon to confirm it."}
      </motion.p>

      {/* ID الطلب – أنيميشان رايق */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-gray-400 mb-6 text-base"
      >
        <span className="opacity-80">Order ID:</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-cyan-300 font-semibold ml-1"
        >
          {orderId}
        </motion.span>
      </motion.div>

      {/* زر الإغلاق */}
      <motion.button
        whileHover={{ scale: 1.08, boxShadow: "0 0 15px rgba(0,255,255,0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowModal(false);
          router.push("/sales");
        }}
        className="px-7 py-3 bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 rounded-2xl backdrop-blur-sm 
                   transition-all font-semibold tracking-wide hover:bg-cyan-500/30"
      >
        {lang === "ar" ? "إغلاق والانتقال للمبيعات" : "Close & Go to Sales"}
      </motion.button>

    </motion.div>
  </motion.div>
)}


      <Toaster position="top-center" />
      <Navbar
        lang={lang}
        onToggleLang={() => {
          const nl = lang === "ar" ? "en" : "ar";
          setLang(nl);
          localStorage.setItem("bh_lang", nl);
        }}
        cart={cart}
        user={auth.currentUser}
        onLogout={async () => {
          await auth.signOut();
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.h1
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400"
        >
          {lang === "ar" ? "إتمام الطلب" : "Checkout"}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === Left Form === */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal */}
            <section className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <h2 className="font-semibold mb-3 text-cyan-300">
                {lang === "ar" ? "البيانات الشخصية" : "Personal Info"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label={lang === "ar" ? "الاسم الكامل" : "Full name"} icon={<FaUser />} value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
                <Input label={lang === "ar" ? "البريد الإلكتروني" : "Email"} icon={<FaEnvelope />} value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                <Input label={lang === "ar" ? "الهاتف" : "Phone"} icon={<FaPhone />} value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
              </div>
            </section>

            {/* Address */}
            <section className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-cyan-300">{lang === "ar" ? "العنوان" : "Address"}</h2>
                <button onClick={handleSaveAddress} disabled={savingAddress} className="text-xs flex items-center gap-1 text-cyan-300 hover:text-cyan-400 transition">
                  <FaSave /> {savingAddress ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ العنوان" : "Save")}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label={lang === "ar" ? "الشارع" : "Street"} icon={<FaMapMarkerAlt />} value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                <Input label={lang === "ar" ? "المدينة" : "City"} icon={<FaCity />} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                <Input label={lang === "ar" ? "المحافظة" : "State"} icon={<FaBuilding />} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              </div>
            </section>

            {/* Payment */}
            {/* 💸 Payment Section - Cash Only Version */}
<section className="bg-white/5 p-5 rounded-2xl border border-white/10">
  <h2 className="font-semibold mb-3 text-cyan-300">
    {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
  </h2>

  {/* ✅ Cash on Delivery Option Only */}
  <div className="flex gap-3 flex-wrap">
    <button
      onClick={() => setPaymentMethod("cod")}
      className={`flex-1 p-4 rounded-xl border transition-all duration-300 
        ${paymentMethod === "cod"
          ? "bg-cyan-500/25 border-cyan-400 shadow-lg shadow-cyan-500/10"
          : "border-white/10 hover:border-cyan-400/40 hover:bg-white/5"}
      `}
    >
      <FaMoneyBillWave className="inline ml-2 text-cyan-400 text-lg" />{" "}
      {lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
    </button>
  </div>

  {/* 🕐 Coming Soon Message */}
  <div className="mt-5 text-center text-sm text-gray-400 italic">
    {lang === "ar"
      ? "💳 سيتم توفير الدفع الإلكتروني قريبًا عبر إنسا باي ووسائل أخرى."
      : "💳 Online payment options (InsaPay & others) coming soon."}
  </div>
</section>


            {/* Coupon */}
            <section className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <h2 className="font-semibold mb-3 text-cyan-300">{lang === "ar" ? "كوبون خصم" : "Discount Coupon"}</h2>
              <div className="flex gap-3">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 p-3 rounded-lg bg-transparent border border-white/10 focus:border-cyan-400 outline-none" placeholder={lang === "ar" ? "أدخل كود الخصم" : "Enter coupon code"} />
                <button onClick={applyCoupon} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">{lang === "ar" ? "تطبيق" : "Apply"}</button>
              </div>
            </section>
          </div>

          {/* === Summary === */}
          <aside className="space-y-4 sticky top-24">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <h3 className="font-semibold text-cyan-300 mb-3">{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</h3>

              {cart.length === 0 ? (
                <p className="text-gray-400">{lang === "ar" ? "السلة فارغة" : "Cart is empty"}</p>
              ) : (
                <>
                  {cart.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <div className="truncate max-w-[200px]">{(it.name && (it.name[lang] || it.name)) || it.title}</div>
                      <div className="font-semibold">{(it.price * (it.quantity || 1)).toLocaleString()} ج</div>
                    </div>
                  ))}
                  <hr className="my-3 border-white/10" />
                  <div className="flex justify-between text-sm">
                    <span>{lang === "ar" ? "المجموع" : "Subtotal"}</span>
                    <span>{subtotal.toLocaleString()} ج</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{lang === "ar" ? "الخصم" : "Discount"}</span>
                    <span>-{discount.toLocaleString()} ج</span>
                  </div>
                  <div className="flex justify-between mt-3 text-lg font-bold text-cyan-300">
                    <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                    <span>{total.toLocaleString()} ج</span>
                  </div>

                  <button onClick={handlePlaceOrder} disabled={loading} className={`w-full mt-4 py-3 rounded-xl font-bold ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg"}`}>
                    {loading ? (lang === "ar" ? "جارٍ إرسال الطلب..." : "Placing order...") : (lang === "ar" ? "تأكيد الطلب" : "Place order")}
                  </button>

                  <Link href="/sales" className="mt-3 block text-center text-sm text-gray-300 hover:underline">
                    {lang === "ar" ? "العودة للتسوق" : "Continue shopping"}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ✅ Reusable Input Component */
function Input({ label, icon, ...props }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-gray-300 mb-1 block">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300">{icon}</span>
        <input {...props} className="w-full p-3 pl-12 rounded-lg bg-transparent border border-white/10 focus:border-cyan-400 outline-none transition-all" />
      </div>
    </label>
  );
}




