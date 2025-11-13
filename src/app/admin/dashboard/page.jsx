// app/admin/dashboard/page.jsx
"use client";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/products" className="p-4 bg-blue-500 text-white rounded">المنتجات</Link>
        <Link href="/admin/orders" className="p-4 bg-green-500 text-white rounded">الطلبات</Link>
        <Link href="/admin/customers" className="p-4 bg-yellow-500 text-white rounded">العملاء</Link>
        <Link href="/admin/offers" className="p-4 bg-red-500 text-white rounded">العروض</Link>
      </div>
    </div>
  );
}
