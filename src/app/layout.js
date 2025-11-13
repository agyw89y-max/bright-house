"use client";
import "./globals.css";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState("loading");
  const [lang, setLang] = useState("ar");
useEffect(() => {
  const savedLang = localStorage.getItem("bh_lang");
  if (savedLang) setLang(savedLang);

  // ⏳ في البداية خليه "loading" فعلاً
  setUser("loading");

  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log("👤 Firebase user changed:", currentUser);
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem("bh_user", JSON.stringify(currentUser));
    } else {
      setUser(null);
      localStorage.removeItem("bh_user");
    }
  });

  return unsubscribe;
}, []);


  // ✅ حفظ المستخدم عند تسجيل الدخول
  useEffect(() => {
    if (user && user !== "loading") {
      localStorage.setItem("bh_user", JSON.stringify(user));
    } else if (user === null) {
      localStorage.removeItem("bh_user");
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("bh_user");
    setUser(null);
    router.push("/");
  };

  const handleToggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("bh_lang", newLang);
  };

  return (
    <html lang={lang}>
      <body
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="bg-[#010b1b] text-white min-h-screen"
      >
        {user !== "loading" && (
          <Navbar
            lang={lang}
            onToggleLang={handleToggleLang}
            cart={[]}
            user={user}
            onLogout={handleLogout}
          />
        )}

        <main className="pt-[85px]">{children}</main>
      </body>
    </html>
  );
}
