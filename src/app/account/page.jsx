"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { 
  FaUserAlt, FaEnvelope, FaPhoneAlt, FaBoxOpen, FaMapMarkedAlt, FaCog, FaSignOutAlt, FaPlus, FaTrash, FaEdit, FaGlobe 
} from "react-icons/fa";

import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { ref, get,onValue,set } from "firebase/database";

export default function AccountPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ar");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: "", street: "", city: "", state: "", notes: "" });

  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [toast, setToast] = useState(null);
const [selectedOrder, setSelectedOrder] = useState(null);
const [notifications, setNotifications] = useState([]);

const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("bh_user");
  return saved ? JSON.parse(saved) : null;
});


  // تحميل بيانات المستخدم من Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const snapshot = await get(ref(db, `users/${user.uid}`));
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          const newUser = { 
            name: user.displayName || "", 
            email: user.email, 
            phone: "", 
            orders: [], 
            addresses: [] 
          };
          await set(ref(db, `users/${user.uid}`), newUser);
          setUserData(newUser);
        }
      } catch (err) {
        console.error(err);
        showToast(lang === "ar" ? "خطأ في تحميل البيانات" : "Error loading data");
      } finally {
        setLoading(false);
      }
    });

    const savedLang = localStorage.getItem("bh_lang");
    if (savedLang) setLang(savedLang);

    return unsubscribe;
  }, []);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem("bh_user", JSON.stringify(currentUser));
    } else {
      setUser(null);
      localStorage.removeItem("bh_user");
      router.push("/login");
    }
  });
  return unsubscribe;
}, []);



useEffect(() => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const notificationsRef = ref(db, `notifications/${userId}`);

  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const formatted = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(formatted);
    } else {
      setNotifications([]);
    }
  });

  return () => unsubscribe();
}, [auth.currentUser]);










  const saveUserData = async (newData) => {
    if (!auth.currentUser) return;
    setUserData(newData);
    try {
      await set(ref(db, `users/${auth.currentUser.uid}`), newData);
    } catch (err) {
      console.error(err);
      showToast(lang === "ar" ? "خطأ في حفظ البيانات" : "Error saving data");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center text-white">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</main>;







  if (!userData) {
  return (
    <main className="min-h-screen flex items-center justify-center text-white bg-[#050a25]">
      {lang === "ar" ? "جار تحميل بيانات المستخدم..." : "Loading user data..."}
    </main>
  );
}

  const tabVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  return (
   
   
   <main className="min-h-screen bg-gradient-to-br from-[#050a25] via-[#081648] to-[#0b245c] text-white font-[Cairo] pb-20">
<Navbar
  lang={lang}
  onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
  cart={[]}
  user={user}
  onLogout={handleLogout}
/>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-center font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-lg">
          {lang === "ar" ? "بياناتي الشخصية" : "Personal Info"}
        </h1>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1 bg-white/6 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex flex-col gap-3">
              <div className="px-2 py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/10 flex items-center gap-3">
                <FaUserAlt className="text-cyan-300 text-2xl" />
                <div>
                 <div className="text-sm text-gray-200">{userData?.name || "مستخدم بدون اسم"}</div>
<div className="text-xs text-gray-400">{userData?.email || "لا يوجد بريد"}</div>

                </div>
              </div>

              <nav className="flex flex-col mt-4 gap-2">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "info" ? "bg-cyan-500/20 border border-cyan-400" : "hover:bg-white/5"}`}
                >
                  <FaUserAlt /> {lang === "ar" ? "بياناتي" : "My Info"}
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "orders" ? "bg-blue-500/20 border border-blue-400" : "hover:bg-white/5"}`}
                >
                  <FaBoxOpen /> {lang === "ar" ? "طلباتي" : "Orders"}
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "addresses" ? "bg-cyan-500/15 border border-cyan-300" : "hover:bg-white/5"}`}
                >
                  <FaMapMarkedAlt /> {lang === "ar" ? "عناويني" : "Addresses"}
                </button>




                <button
  onClick={() => setActiveTab("notifications")}
  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${
    activeTab === "notifications"
      ? "bg-purple-500/20 border border-purple-400"
      : "hover:bg-white/5"
  }`}
>
  <FaGlobe /> {lang === "ar" ? "الإشعارات" : "Notifications"}
</button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition ${activeTab === "settings" ? "bg-white/10 border border-white/10" : "hover:bg-white/5"}`}
                >
                  <FaCog /> {lang === "ar" ? "الإعدادات" : "Settings"}
                </button>
              </nav>

              <div className="mt-4 border-t border-white/6 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition font-semibold"
                >
                  <FaSignOutAlt /> {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="col-span-1 md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white/6 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <FaUserAlt className="text-cyan-400" /> {lang === "ar" ? "بياناتي الشخصية" : "Personal Info"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <FaUserAlt className="text-cyan-300 text-xl" />
                      <div>
                        <div className="text-xs text-gray-400">{lang === "ar" ? "الاسم" : "Name"}</div>
                       <div className="font-semibold">{userData?.name || "غير متوفر"}</div>

                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <FaEnvelope className="text-cyan-300 text-xl" />
                      <div>
                        <div className="text-xs text-gray-400">{lang === "ar" ? "البريد" : "Email"}</div>
                      <div className="font-semibold">{userData?.email || "لا يوجد بريد"}</div>

                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <FaPhoneAlt className="text-cyan-300 text-xl" />
                      <div>
                        <div className="text-xs text-gray-400">{lang === "ar" ? "الهاتف" : "Phone"}</div>
                        <div className="font-semibold">{userData.phone}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
























              












{activeTab === "orders" && (
  <motion.div
    key="orders"
    variants={tabVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="bg-white/6 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <FaBoxOpen className="text-blue-400" />
        {lang === "ar" ? "طلباتي السابقة" : "My Orders"}
      </h2>
      <div className="text-sm text-gray-300">
        {userData.orders ? Object.keys(userData.orders).length : 0}{" "}
        {lang === "ar" ? "طلب" : "orders"}
      </div>
    </div>

    {/* حالة عرض الطلبات */}
    {userData.orders && Object.keys(userData.orders).length > 0 ? (
      <div className="space-y-4">

           {Object.entries(userData.orders)
          .reverse()
          .map(([key, order]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedOrder(order)} // يفتح المودال
              className="cursor-pointer bg-[#071233]/60 hover:bg-[#0b1a4f]/70 transition-all p-4 rounded-xl border border-white/8 flex flex-col md:flex-row md:justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">
                    {lang === "ar" ? "رقم الطلب:" : "Order ID:"}
                  </span>{" "}
                  <span className="text-cyan-300">
                    {order.id || key.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {lang === "ar" ? "التاريخ:" : "Date:"}{" "}
                  {new Date(order.date).toLocaleDateString("ar-EG")}
                </div>
                <div className="text-sm text-gray-400">
                  {lang === "ar" ? "العناصر:" : "Items:"}{" "}
                  {order.cart?.length || order.items?.length || 0}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {lang === "ar" ? "الإجمالي" : "Total"}
                  </div>
                  <div className="font-bold text-cyan-300">
                    {order.total?.toLocaleString?.() ?? order.total} جنيه
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded-full font-semibold text-sm"
                  style={{
                    background:
                      order.status === "مكتمل" || order.status === "completed"
                        ? "rgba(16,185,129,0.12)"
                        : order.status === "تم الشحن" || order.status === "shipped"
                        ? "rgba(59,130,246,0.08)"
                        : "rgba(250,204,21,0.08)",
                    color:
                      order.status === "مكتمل" || order.status === "completed"
                        ? "#10B981"
                        : order.status === "تم الشحن" || order.status === "shipped"
                        ? "#3B82F6"
                        : "#FACC15",
                  }}
                >
                  {order.status === "completed" || order.status === "مكتمل"
                    ? lang === "ar"
                      ? "مكتمل"
                      : "Completed"
                    : order.status === "shipped" || order.status === "تم الشحن"
                    ? lang === "ar"
                      ? "تم الشحن"
                      : "Shipped"
                    : lang === "ar"
                    ? "قيد المعالجة"
                    : "Processing"}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400">
        {lang === "ar"
          ? "لم تقم بأي طلبات بعد."
          : "You have no orders yet."}
      </div>
    )}

    {/* مودال التفاصيل */}
    {selectedOrder && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setSelectedOrder(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0b143d] rounded-2xl shadow-2xl p-6 w-[90%] max-w-md border border-white/10"
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-4">
            {lang === "ar" ? "تفاصيل الطلب" : "Order Details"}
          </h3>

          <div className="space-y-2 text-gray-300 text-sm">
            <p>
              <span className="font-semibold">{lang === "ar" ? "رقم الطلب:" : "Order ID:"}</span>{" "}
              {selectedOrder.id}
            </p>
            <p>
              <span className="font-semibold">{lang === "ar" ? "التاريخ:" : "Date:"}</span>{" "}
              {new Date(selectedOrder.date).toLocaleDateString("ar-EG")}
            </p>
            <p>
              <span className="font-semibold">{lang === "ar" ? "الحالة:" : "Status:"}</span>{" "}
              {selectedOrder.status}
            </p>
            <p>
              <span className="font-semibold">{lang === "ar" ? "الإجمالي:" : "Total:"}</span>{" "}
              {selectedOrder.total} جنيه
            </p>
            {selectedOrder.address && (
              <p>
                <span className="font-semibold">{lang === "ar" ? "العنوان:" : "Address:"}</span>{" "}
                {selectedOrder.address}
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="font-semibold text-gray-200 mb-2">
              {lang === "ar" ? "العناصر المطلوبة:" : "Ordered Items:"}
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm max-h-40 overflow-y-auto">
              {(selectedOrder.cart || selectedOrder.items)?.map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.quantity} — {item.price} جنيه
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setSelectedOrder(null)}
            className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 transition-all text-white font-semibold py-2 rounded-xl"
          >
            {lang === "ar" ? "إغلاق" : "Close"}
          </button>
        </motion.div>
      </motion.div>
    )}
  </motion.div>
)}

































              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white/6 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <FaMapMarkedAlt className="text-cyan-300" /> {lang === "ar" ? "عناويني" : "My Addresses"}
                    </h2>
                    <button onClick={() => { setEditingAddress(null); setAddressForm({ label: "", street: "", city: "", state: "", notes: "" }); setAddrModalOpen(true); }} 
                      className="flex items-center gap-2 px-3 py-2 bg-cyan-500 rounded-full text-sm font-semibold hover:shadow-md">
                      <FaPlus /> {lang === "ar" ? "أضف عنوان" : "Add Address"}
                    </button>
                  </div>

                  {userData.addresses && userData.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.addresses.map((a, i) => (
                        <div key={a.id || i} className="bg-[#071233]/60 p-4 rounded-xl border border-white/8 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-cyan-300">{a.label || (lang === "ar" ? "عنوان" : "Address")}</div>
                              <div className="text-sm text-gray-300">{a.street}</div>
                              <div className="text-xs text-gray-400">{a.city} - {a.state}</div>
                              {a.notes && <div className="text-xs text-gray-400 mt-1">Note: {a.notes}</div>}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => { setEditingAddress(i); setAddressForm(a); setAddrModalOpen(true); }} className="p-2 rounded-md bg-white/6 hover:bg-white/8">
                                <FaEdit />
                              </button>
                              <button onClick={() => {
                                if (!confirm(lang === "ar" ? "هل تريد حذف هذا العنوان؟" : "Delete this address?")) return;
                                const copy = { ...userData };
                                copy.addresses = copy.addresses.filter((_, idx) => idx !== i);
                                saveUserData(copy);
                                showToast(lang === "ar" ? "تم حذف العنوان" : "Address deleted");
                              }} className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30">
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      {lang === "ar" ? "لم تضيف أي عناوين بعد." : "No addresses yet."}
                    </div>
                  )}
                </motion.div>
              )}













{activeTab === "notifications" && (
  <motion.div
    key="notifications"
    variants={tabVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="bg-white/6 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <FaGlobe className="text-purple-400" />
        {lang === "ar" ? "الإشعارات" : "Notifications"}
      </h2>
    </div>

    {notifications.length > 0 ? (
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            className="bg-[#071233]/70 border border-white/10 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <div className="text-cyan-300 font-semibold">{n.title}</div>
              <div className="text-gray-300 text-sm">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.timestamp).toLocaleString("ar-EG")}
              </div>
            </div>
            {n.read ? (
              <span className="text-green-400 text-sm">✔️</span>
            ) : (
              <button
                onClick={async () => {
                  const updated = notifications.map((x) =>
                    x === n ? { ...x, read: true } : x
                  );
                  setNotifications(updated);
                  await set(ref(db, `notifications/${auth.currentUser.uid}/${n.id}`), {
                    ...n,
                    read: true,
                  });
                }}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-full text-sm"
              >
                {lang === "ar" ? "تم القراءة" : "Mark as read"}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400">
        {lang === "ar" ? "لا توجد إشعارات حالياً" : "No notifications yet."}
      </div>
    )}
  </motion.div>
)}








              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white/6 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <FaCog className="text-cyan-300" /> {lang === "ar" ? "الإعدادات" : "Settings"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-gray-300 mb-2">{lang === "ar" ? "اللغة" : "Language"}</div>
                      <div className="flex gap-2">
                        <button onClick={() => { setLang("ar"); localStorage.setItem("bh_lang", "ar"); showToast("تم تغيير اللغة إلى العربية"); }} className={`flex-1 py-2 rounded-lg ${lang==="ar"?"bg-cyan-500/30":"bg-white/5"}`}>العربية</button>
                        <button onClick={() => { setLang("en"); localStorage.setItem("bh_lang", "en"); showToast("Language changed to English"); }} className={`flex-1 py-2 rounded-lg ${lang==="en"?"bg-cyan-500/30":"bg-white/5"}`}>English</button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-gray-300 mb-2">{lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}</div>
                      <input type="password" placeholder={lang==="ar"?"كلمة المرور الحالية":"Current password"} value={pwdForm.current} onChange={e=>setPwdForm({...pwdForm,current:e.target.value})} className="w-full p-2 rounded-md bg-transparent border border-white/10 mb-2"/>
                      <input type="password" placeholder={lang==="ar"?"كلمة المرور الجديدة":"New password"} value={pwdForm.newPwd} onChange={e=>setPwdForm({...pwdForm,newPwd:e.target.value})} className="w-full p-2 rounded-md bg-transparent border border-white/10 mb-2"/>
                      <input type="password" placeholder={lang==="ar"?"تأكيد كلمة المرور":"Confirm new password"} value={pwdForm.confirm} onChange={e=>setPwdForm({...pwdForm,confirm:e.target.value})} className="w-full p-2 rounded-md bg-transparent border border-white/10 mb-2"/>
                      <button onClick={async ()=>{
                        if(pwdForm.newPwd!==pwdForm.confirm){showToast(lang==="ar"?"تأكيد كلمة المرور غير مطابق":"Confirmation does not match"); return;}
                        if(pwdForm.newPwd.length<6){showToast(lang==="ar"?"كلمة المرور يجب أن تكون 6 أحرف على الأقل":"Password must be at least 6 chars"); return;}
                        try{if(auth.currentUser){await updatePassword(auth.currentUser,pwdForm.newPwd); showToast(lang==="ar"?"تم تغيير كلمة المرور":"Password updated"); setPwdForm({current:"",newPwd:"",confirm:""});}}catch(e){console.error(e); showToast(lang==="ar"?"فشل في تغيير كلمة المرور":"Failed to update password");}
                      }} className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold">{lang==="ar"?"حفظ":"Save"}</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addrModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{y:30,scale:0.98}} animate={{y:0,scale:1}} exit={{y:-20,scale:0.98}} className="w-full max-w-lg bg-[#07133a] p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4">{editingAddress===null?(lang==="ar"?"أضف عنوان":"Add Address"):(lang==="ar"?"تعديل العنوان":"Edit Address")}</h3>
              <div className="grid grid-cols-1 gap-3">
                <input value={addressForm.label} onChange={e=>setAddressForm({...addressForm,label:e.target.value})} placeholder={lang==="ar"?"اسم العنوان (منزل/شغل)":"Label (Home/Work)"} className="p-3 rounded-xl bg-white/5 border border-white/10"/>
                <input value={addressForm.street} onChange={e=>setAddressForm({...addressForm,street:e.target.value})} placeholder={lang==="ar"?"الشارع":"Street"} className="p-3 rounded-xl bg-white/5 border border-white/10"/>
                <div className="grid grid-cols-2 gap-3">
                  <input value={addressForm.city} onChange={e=>setAddressForm({...addressForm,city:e.target.value})} placeholder={lang==="ar"?"المدينة":"City"} className="p-3 rounded-xl bg-white/5 border border-white/10"/>
                  <input value={addressForm.state} onChange={e=>setAddressForm({...addressForm,state:e.target.value})} placeholder={lang==="ar"?"المحافظة / الولاية":"State"} className="p-3 rounded-xl bg-white/5 border border-white/10"/>
                </div>
                <textarea value={addressForm.notes} onChange={e=>setAddressForm({...addressForm,notes:e.target.value})} placeholder={lang==="ar"?"ملاحظات (اختياري)":"Notes (optional)"} className="p-3 rounded-xl bg-white/5 border border-white/10"/>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button onClick={()=>setAddrModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/6">{lang==="ar"?"إلغاء":"Cancel"}</button>
                <button onClick={()=>{
                  if(!addressForm.street.trim()||!addressForm.city.trim()||!addressForm.state.trim()){showToast(lang==="ar"?"الرجاء ملء الشارع والمدينة والمحافظة":"Please fill street, city and state"); return;}
                  const copy={...userData};
                  if(!copy.addresses) copy.addresses=[];
                  if(editingAddress===null){copy.addresses.push({...addressForm,id:Date.now().toString()});}
                  else{copy.addresses[editingAddress]={...addressForm,id:copy.addresses[editingAddress].id||Date.now().toString()};}
                  saveUserData(copy);
                  setAddrModalOpen(false);
                  showToast(lang==="ar"?"تم حفظ العنوان":"Address saved");
                }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">{lang==="ar"?"حفظ":"Save"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 bg-[#0b223f] text-white px-4 py-2 rounded-full shadow-md">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}    




