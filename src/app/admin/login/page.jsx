// app/admin/login/page.jsx
"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      alert("فشل تسجيل الدخول: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl mb-4">تسجيل دخول الإدارة</h1>
        <input type="email" placeholder="البريد" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
        <input type="password" placeholder="كلمة السر" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded"/>
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded">دخول</button>
      </div>
    </div>
  );
}
