'use client';

import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, FaCheck, FaTruck, FaClipboardCheck, 
  FaBoxOpen, FaSearch, FaClock, FaTimes, FaFilter 
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [lang, setLang] = useState('ar');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data)
          .map(([id, order]) => ({
            id,
            ...order,
            timestamp: order.timestamp || new Date(order.date || Date.now()).getTime(),
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setOrders(formatted);
      } else setOrders([]);
    });
  }, []);

  /** 🗑️ حذف الطلب */
  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا الطلب؟')) return;
    await remove(ref(db, `orders/${id}`));
    toast.success('تم حذف الطلب ✅');
  };

  /** 🔄 تحديث الحالة + إرسال إشعار للمستخدم */
  const handleStatusUpdate = async (id, newStatus) => {
    const orderRef = ref(db, `orders/${id}`);
    const order = orders.find((o) => o.id === id);

    await update(orderRef, { status: newStatus });

    // 📨 إرسال إشعار للمستخدم
    if (order?.userId) {
      const notificationsRef = ref(db, `notifications/${order.userId}`);
      const messages = {
        confirmed: {
          title: 'تم تأكيد طلبك ✅',
          message: 'طلبك تم تأكيده وهو الآن قيد التجهيز.',
        },
        shipped: {
          title: '📦 تم شحن طلبك!',
          message: 'طلبك في الطريق إليك، يمكنك تتبعه الآن.',
        },
        completed: {
          title: '🎉 تم تسليم الطلب',
          message: 'نشكرك على التسوق معنا ❤️',
        },
        pending: {
          title: '🕓 طلبك قيد التنفيذ',
          message: 'طلبك ما زال قيد المعالجة.',
        },
      };

      const notification = {
        ...messages[newStatus],
        timestamp: Date.now(),
        read: false,
        orderId: id,
        status: newStatus,
      };

      await push(notificationsRef, notification);
    }

    const statusMsg = {
      confirmed: '✅ تم تأكيد الطلب',
      shipped: '📦 تم شحن الطلب',
      completed: '🎉 تم إكمال الطلب',
      pending: '🕓 قيد التنفيذ',
    };

    toast.success(statusMsg[newStatus] || 'تم تحديث الحالة');
  };

  /** 🔍 فلترة حسب البحث والحالة */
  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.personal?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.personal?.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /** 🎨 ألوان الحالة */
  const statusClasses = {
    completed: 'from-emerald-500/20 to-green-400/20 text-emerald-300 border-emerald-500/40',
    shipped: 'from-blue-500/20 to-cyan-400/20 text-blue-300 border-blue-500/40',
    confirmed: 'from-purple-500/20 to-fuchsia-400/20 text-purple-300 border-purple-500/40',
    pending: 'from-yellow-500/20 to-amber-300/20 text-yellow-300 border-yellow-500/40',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050a25] via-[#081648] to-[#0b245c] text-white font-[Cairo] pb-20">
      <Toaster position="top-center" />
      <Navbar
        lang={lang}
        setLang={setLang}
        onToggleLang={() => {
          const newLang = lang === 'ar' ? 'en' : 'ar';
          setLang(newLang);
          localStorage.setItem('bh_lang', newLang);
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          لوحة إدارة الطلبات
        </motion.h1>

        {/* 🔍 بحث وفلترة */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-6">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              placeholder="ابحث باسم العميل أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 🧩 فلترة بالحالة */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد التنفيذ</option>
              <option value="confirmed">تم التأكيد</option>
              <option value="shipped">تم الشحن</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>

        {/* 📦 جدول الطلبات */}
        <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-white/10 text-cyan-400">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">العميل</th>
                <th className="p-3">المدينة</th>
                <th className="p-3">المجموع</th>
                <th className="p-3">الدفع</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">تاريخ</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-white/10 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      <div className="font-semibold">{order.personal?.name}</div>
                      <div className="text-gray-400 text-xs">{order.personal?.phone}</div>
                    </td>
                    <td className="p-3">{order.address?.city}</td>
                    <td className="p-3 text-cyan-300 font-semibold">{order.total?.toLocaleString()} جنيه</td>
                    <td className="p-3">{order.payment === 'cod' ? 'عند الاستلام' : 'InstaPay'}</td>

                    <td className="p-3">
                      <motion.div
                        key={order.status}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-semibold shadow-md text-sm border bg-gradient-to-r ${statusClasses[order.status]}`}
                      >
                        {order.status === 'completed' && <FaCheck className="text-emerald-400" />}
                        {order.status === 'shipped' && <FaTruck className="text-blue-400" />}
                        {order.status === 'confirmed' && <FaClipboardCheck className="text-purple-400" />}
                        {order.status === 'pending' && <FaClock className="text-yellow-300" />}
                        <span>
                          {order.status === 'completed'
                            ? 'مكتمل'
                            : order.status === 'shipped'
                            ? 'تم الشحن'
                            : order.status === 'confirmed'
                            ? 'تم التأكيد'
                            : 'قيد التنفيذ'}
                        </span>
                      </motion.div>
                    </td>

                    <td className="p-3 text-gray-400">
                      {new Date(order.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-3 flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30 transition text-sm"
                      >
                        <FaBoxOpen /> عرض
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition text-sm"
                      >
                        <FaTrash /> حذف
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">
                    <FaClock className="mx-auto mb-2 text-3xl opacity-50" />
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪟 Modal عرض تفاصيل الطلب */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white/10 backdrop-blur-lg border border-cyan-400/30 p-8 rounded-2xl w-[90%] max-w-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-cyan-400">تفاصيل الطلب</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-300 hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-gray-200">
                <p><strong>العميل:</strong> {selectedOrder.personal?.name}</p>
                <p><strong>الهاتف:</strong> {selectedOrder.personal?.phone}</p>
                <p><strong>العنوان:</strong> {selectedOrder.address?.street}, {selectedOrder.address?.city}</p>
                <p><strong>طريقة الدفع:</strong> {selectedOrder.payment === 'cod' ? 'عند الاستلام' : 'InstaPay'}</p>
                <p><strong>التاريخ:</strong> {new Date(selectedOrder.date).toLocaleString('ar-EG')}</p>
                <p><strong>الإجمالي:</strong> {selectedOrder.total?.toLocaleString()} جنيه</p>

                <div className="pt-4">
                  <label className="block mb-2 text-cyan-300 font-semibold">تغيير حالة الطلب:</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className="w-full bg-white/10 border border-cyan-400/30 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="pending">قيد التنفيذ</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="completed">مكتمل</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
