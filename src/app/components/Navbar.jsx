"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaBars,
  FaShoppingCart,
  FaSignOutAlt,
  FaHome,
  FaStore,
  FaTools,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";
import { Sparkles } from "lucide-react";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

// ✅ Hook ديناميكي للمقاسات
function useLayoutConfig() {
  const [config, setConfig] = useState({
    mode: "desktop",
    headerHeight: 165,
    pageOffset: -170,
  });

  useEffect(() => {
    const updateConfig = () => {
      const screenWidth = window.innerWidth;
      let newConfig;

      if (screenWidth >= 1024) {
        newConfig = {
          mode: "desktop",
          headerHeight: Math.min(180, Math.max(150, screenWidth * 0.12)),
          pageOffset: -window.innerHeight * 0.18,
        };
      } else if (screenWidth >= 768) {
        newConfig = {
          mode: "tablet",
          headerHeight: Math.min(120, Math.max(80, screenWidth * 0.1)),
          pageOffset: -window.innerHeight * 0.12,
        };
      } else {
        newConfig = {
          mode: "mobile",
          headerHeight: Math.min(80, Math.max(60, screenWidth * 0.15)),
          pageOffset: -window.innerHeight * 0.08,
        };
      }

      setConfig(newConfig);
    };

    updateConfig();
    window.addEventListener("resize", updateConfig);
    return () => window.removeEventListener("resize", updateConfig);
  }, []);

  return config;
}

export default function Navbar({ lang, onToggleLang, cart = [], user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerRef = useRef(null);
  const router = useRouter();
  const { headerHeight, pageOffset, mode } = useLayoutConfig();

  const isMobile = mode === "mobile";
  const isLoading = user === "loading";
  const isLoggedIn = !!user && user !== "loading";

  const pageLinks = [
    { id: "home", label: { ar: "الرئيسية", en: "Home" }, href: "/", Icon: FaHome },
    { id: "sales", label: { ar: "المبيعات", en: "Sales" }, href: "/sales", Icon: FaStore },
    { id: "maintenance", label: { ar: "الصيانة", en: "Maintenance" }, href: "/maintenance", Icon: FaTools },
    { id: "account", label: { ar: "الحساب", en: "Account" }, href: "/account", Icon: FaUserCircle },
  ];

  const toggleLang = () => {
    if (typeof onToggleLang === "function") onToggleLang();
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  








  return (
    <>
      <header
        ref={headerRef}
        style={{ height: headerHeight }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#010b1b]/90 border-b border-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.25)] transition-all duration-300 ease-out"
      >
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-col gap-1">
          {/* === TOP BAR === */}
          <div className="flex justify-between items-center h-12">
            {/* === Logo === */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </div>
              <span className="text-white font-semibold text-base tracking-wide flex items-center gap-1">
                Bright House
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
              </span>
            </Link>

            {/* === Right Section (Desktop) === */}
            {!isMobile && (
              <div className="flex items-center gap-3 text-white">
                {/* === Cart === */}
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_8px_rgba(0,200,255,0.3)] hover:scale-105 transition-transform"
                >
                  <FaShoppingCart />
                  <span>{lang === "ar" ? "العربة" : "Cart"}</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full animate-pulse">
                      {cart.reduce((s, it) => s + (it.qty || 0), 0)}
                    </span>
                  )}
                </Link>

                {/* === Auth Buttons === */}
                {!isLoading && !isLoggedIn && (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-cyan-500/20 transition"
                    >
                      {lang === "ar" ? "تسجيل دخول" : "Login"}
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-cyan-500/20 transition"
                    >
                      {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
                    </Link>
                  </>
                )}

                {isLoggedIn && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-red-600/20 text-red-400 transition"
                  >
                    <FaSignOutAlt /> {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                )}

                {/* === Language Switch === */}
                <motion.button
                  onClick={toggleLang}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center font-semibold text-xs text-white shadow-[0_0_6px_rgba(0,255,255,0.4)]"
                >
                  {lang === "ar" ? "EN" : "AR"}
                </motion.button>
              </div>
            )}

            {/* === Mobile Controls === */}
            {isMobile && (
              <div className="flex items-center gap-2 text-cyan-300">
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-md transition"
                >
                  <FaSearch size={18} />
                </button>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-md transition"
                >
                  <FaBars size={20} />
                </button>
              </div>
            )}
          </div>

          {/* === NAV LINKS === */}
          {!isMobile && (
            <>
              <nav className="flex justify-center gap-4 text-white text-sm">
                {pageLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="flex items-center gap-2 px-2 py-1 hover:text-cyan-300 transition-all rounded-md hover:bg-cyan-500/10"
                  >
                    <link.Icon /> {link.label[lang]}
                  </Link>
                ))}
              </nav>

              {/* === SEARCH BAR === */}
              <div className="flex justify-center mt-1 mb-1">
                <SearchBar
                  lang={lang}
                  className="w-full max-w-md bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-sm placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                />
              </div>
            </>
          )}
        </div>
      </header>

      {/* === Space below header === */}
      <div
        style={{
          paddingTop: `${headerHeight + pageOffset}px`,
          transition: "padding-top 0.3s ease-in-out",
        }}
      />
    </>
  );
}
