"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaShoppingCart,
  FaSignOutAlt,
  FaHome,
  FaStore,
  FaTools,
  FaUserCircle,
  FaSearch,
  FaBroadcastTower,
  FaSignInAlt,
  FaUserPlus,
  FaGlobe,
} from "react-icons/fa";
import { Sparkles } from "lucide-react";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

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
    headerHeight: Math.min(120, Math.max(90, screenWidth * 0.09)),
    pageOffset: -window.innerHeight * 0.12,
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
headerHeight: Math.min(90, Math.max(70, screenWidth * 0.17)),

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

export default function Navbar({ lang = "en", onToggleLang, cart = [], user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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

  const cartCount = cart?.reduce?.((s, it) => s + (it.qty || 0), 0) || 0;

  const toggleLang = () => {
    if (typeof onToggleLang === "function") onToggleLang();
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      if (typeof onLogout === "function") await onLogout();
      else await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // lock body scroll for overlays
  useEffect(() => {
    document.body.style.overflow = sidebarOpen || mobileSearchOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [sidebarOpen, mobileSearchOpen]);

  return (
    <>
      {/* HEADER */}
      <header
        style={{ height: headerHeight }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#010b1b]/90 border-b border-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.25)] transition-all"
      >
       <div className="max-w-7xl mx-auto px-4 py-0 flex flex-col gap-0.5">

          {/* TOP BAR */}
        <div className="flex justify-between items-center h-10">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400 shadow-md">
                <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-semibold text-base flex items-center gap-1">
                Bright House <Sparkles className="w-4 h-4 text-cyan-400" />
              </span>
            </Link>

            {/* DESKTOP CONTROLS */}
            {!isMobile && (
              <div className="flex items-center gap-3 text-white">
                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow hover:scale-105"
                >
                  <FaShoppingCart />
                  <span>{lang === "ar" ? "العربة" : "Cart"}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Auth */}
                {!isLoading && !isLoggedIn ? (
                  <>
                    <Link href="/login" className="px-2 py-1 hover:bg-cyan-500/20 rounded-full">
                      {lang === "ar" ? "تسجيل دخول" : "Login"}
                    </Link>
                    <Link href="/signup" className="px-2 py-1 hover:bg-cyan-500/20 rounded-full">
                      {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
                    </Link>
                  </>
                ) : isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-red-600/20 text-red-400"
                  >
                    <FaSignOutAlt /> {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                ) : null}

                {/* Lang */}
                <motion.button
                  onClick={toggleLang}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-xs"
                >
                  {lang === "ar" ? "EN" : "AR"}
                </motion.button>
              </div>
            )}

            {/* MOBILE CONTROLS */}
            {isMobile && (
              <div className="flex items-center gap-2 text-cyan-300">
                <button onClick={() => setMobileSearchOpen(true)} className="p-2 hover:bg-white/10 rounded-md">
                  <FaSearch size={18} />
                </button>
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-md">
                  <FaBars size={20} />
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP NAV + SEARCH */}
          {!isMobile && (
            <>
            <nav className="flex justify-center gap-3 text-white text-sm mt-[-16px]">

                {pageLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="flex items-center gap-2 px-2 py-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md"
                  >
                    <link.Icon /> {link.label[lang]}
                  </Link>
                ))}
              </nav>

             
<div className="flex justify-center mt-[-3px] mb-0">

                <SearchBar
                  lang={lang}
                  className="w-full max-w-md bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5"
                />
              </div>
            </>
          )}
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 w-[78%] max-w-[330px] bg-[#0d1220] text-white shadow-2xl rounded-r-3xl p-6 flex flex-col"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-cyan-400">
                    <img src="/logo.png" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Bright House</div>
                    <div className="text-[10px] opacity-50">{lang === "ar" ? "القائمة" : "Menu"}</div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  ✕
                </motion.button>
              </div>

              {/* LINKS */}
              <nav className="flex flex-col gap-3">
                {pageLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10"
                  >
                    <link.Icon className="text-cyan-400 text-xl" />
                    <span className="text-sm">{link.label[lang]}</span>
                  </Link>
                ))}
              </nav>

              <div className="my-6 border-t border-white/10" />

              {/* Auth */}
              <div className="flex flex-col gap-3 mt-auto">
                {!isLoading && !isLoggedIn ? (
                  <>
                    <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                      <FaSignInAlt className="text-green-400" />
                      {lang === "ar" ? "تسجيل دخول" : "Login"}
                    </Link>

                    <Link href="/signup" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/20">
                      <FaUserPlus className="text-cyan-300" />
                      {lang === "ar" ? "إنشاء حساب" : "Sign Up"}
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-300"
                  >
                    <FaSignOutAlt />
                    {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                )}

                {/* Language */}
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/20"
                >
                  <FaGlobe className="text-blue-300" />
                  {lang === "ar" ? "تغيير اللغة" : "Change Language"}
                </button>

                {/* Cart */}
                <Link
                  href="/cart"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5"
                >
                  <FaShoppingCart className="text-yellow-300" />
                  {lang === "ar" ? "العربة" : "Cart"}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE SEARCH */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-[#021627]/95 border border-white/10 rounded-2xl p-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-semibold">{lang === "ar" ? "بحث" : "Search"}</div>
                <button onClick={() => setMobileSearchOpen(false)} className="p-2 hover:bg-white/10 rounded-md">
                  ✕
                </button>
              </div>

              <SearchBar
                lang={lang}
                className="w-full bg-white/10 border border-white/20 text-white rounded-full px-4 py-2"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
