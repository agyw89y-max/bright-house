"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ref, get } from "firebase/database";
import { db } from "../firebase/firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import Navbar from "../components/Navbar";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

/**
 * SalesPage — نسخة محسّنة بتصميم راقي، تفاعلات Framer Motion،
 * تحسينات في الأداء، شريط بحث، عرض أقسام ومنتجات بشكل عالمي.
 *
 * ملاحظات:
 * - استعملت نفس بنية البيانات Firebase كما عندك.
 * - تفصيلات CSS داخلية لسهولة النسخ. يمكنك نقلها لملف CSS/Tailwind إذا أحببت.
 */

/* -------------------- CategoryPill: تصميم محسّن -------------------- */
function CategoryPill({ c, lang }) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -6 }}
      onClick={() => router.push(`/sales/${c.id}`)}
      className="flex flex-col items-center w-28 md:w-36 shrink-0 cursor-pointer"
    >
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-gradient-to-b from-white/3 to-white/2 flex items-center justify-center shadow-xl glass neon-border transition-transform">
        {c.image ? (
          <Image
            src={c.image}
            alt={c.name?.[lang] || c.name?.ar || c.name?.en || "Category"}
            width={160}
            height={160}
            className="object-cover w-full h-full"
            priority={false}
          />
        ) : (
          <div className="text-gray-300 px-2 text-center">{c.name?.[lang] || "Category"}</div>
        )}
      </div>
      <div className="mt-2 text-sm text-center text-gray-200 truncate max-w-full">
        {c.name?.[lang] || "Category"}
      </div>
    </motion.div>
  );
}

/* -------------------- ProductCard: نسخة premium -------------------- */
function ProductCard({ p, onAdd, lang }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03, boxShadow: "0 25px 60px rgba(6, 78, 59, 0.16)" }}
      className="card-glass rounded-2xl p-3 min-w-[260px] max-w-[320px] cursor-pointer relative overflow-hidden border border-white/6 transition-transform duration-300"
    >
      <a href={`/product/${p.id}`} className="block rounded-xl overflow-hidden h-44 relative">
        <Image
          src={p.images?.[0] || "/placeholder.png"}
          alt={p.name?.[lang] || p.name?.ar || p.name?.en || "Product"}
          fill
          className="object-cover rounded-xl transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 80vw, 320px"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.18 }}
        />
      </a>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <div className="text-xs text-gray-400">
              {p.categoryName?.[lang] || p.categoryName?.ar || p.categoryName?.en || ""}
            </div>
            <h3 className="font-semibold text-white mt-1 text-sm md:text-base line-clamp-2">
              {p.name?.[lang] || p.name?.ar || p.name?.en || "Unnamed"}
            </h3>

            {p.shortDescription?.[lang] && (
              <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                {p.shortDescription?.[lang] || p.shortDescription?.ar || p.shortDescription?.en || ""}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <div className="font-bold text-cyan-400">EGP {p.price}</div>
              {p.oldPrice && <div className="text-gray-400 line-through text-sm">EGP {p.oldPrice}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onAdd(p)}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-colors text-sm"
            aria-label={lang === "ar" ? "أضف للعربة" : "Add to cart"}
          >
            {lang === "ar" ? "أضف للعربة" : "Add to cart"}
          </motion.button>

          <div className="text-sm text-gray-300">{p.rating ? `${p.rating}★` : "4★"}</div>
        </div>
      </div>
    </motion.article>
  );
}

/* -------------------- Main Page -------------------- */
export default function SalesPage() {
  const router = useRouter();
  const [lang, setLang] = useState("ar");
  const [mounted, setMounted] = useState(false);
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prodsByCat, setProdsByCat] = useState({});
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------- Mounted & LocalStorage ---------- */


  useEffect(() => {
  // ✅ مراقبة المستخدم الحالي من Firebase أو localStorage
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem("bh_user", JSON.stringify(currentUser));
    } else {
      const savedUser = localStorage.getItem("bh_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    }
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("bh_lang") || "ar";
    setLang(savedLang);

    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("bh_lang", lang);
  }, [lang, mounted]);




  /* ---------- Fetch Firebase Data ---------- */
  useEffect(() => {
    let isAlive = true;

    async function fetchAll() {
      try {
        const slidesSnap = await get(ref(db, "salesSlider"));
        const catsSnap = await get(ref(db, "categories"));
        const prodsSnap = await get(ref(db, "products"));

        const slidesArr = slidesSnap.exists()
          ? Object.entries(slidesSnap.val()).map(([id, v]) => ({ id, ...v }))
          : [];

        const catsArr = catsSnap.exists()
          ? Object.entries(catsSnap.val()).map(([id, v]) => ({ id, ...v }))
          : [];

        const prodsArr = prodsSnap.exists()
          ? Object.entries(prodsSnap.val()).map(([id, v]) => ({ id, ...v }))
          : [];

        const grouped = {};
        prodsArr.forEach((p) => {
          const catId = p.categoryId || "general";
          if (!grouped[catId]) grouped[catId] = [];
          grouped[catId].push(p);
        });

        Object.keys(grouped).forEach((catId) => {
          grouped[catId].sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        if (!isAlive) return;
        setSlides(slidesArr);
        setCategories(catsArr);
        setProdsByCat(grouped);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        if (!isAlive) return;
        setLoading(false);
        setTimeout(() => setLoadingSkeleton(false), 350);
      }
    }

    fetchAll();

    return () => {
      isAlive = false;
    };
  }, []);

  /* ---------- Filter products ---------- */
  const filterList = (list) => {
    if (!mounted || !searchTerm) return list;
    const q = searchTerm.trim().toLowerCase();
    return list.filter((p) => {
      const nameAr = (p.name?.ar || "").toLowerCase();
      const nameEn = (p.name?.en || "").toLowerCase();
      return nameAr.includes(q) || nameEn.includes(q);
    });
  };

  /* ---------- Add to cart ---------- */
  const addToCart = (product) => {
    const exists = cart.find((c) => c.id === product.id);
    const updatedCart = exists
      ? cart.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c))
      : [...cart, { ...product, qty: 1 }];

    setCart(updatedCart);
    localStorage.setItem("bh_cart", JSON.stringify(updatedCart));

    toast.success(
      <span>
        {product.name?.[lang] || product.name} <strong>{lang === "ar" ? "أضيفت للعربة" : "added to cart"}</strong>
      </span>,
      { duration: 2000, style: { background: "#071026", color: "#fff" } }
    );
  };

  const handleLogout = () => setUser(null);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020318] via-[#041029] to-[#061025] text-white pb-28">
      <Toaster />

      {/* ---------- Navbar ---------- */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
        cart={cart}
        user={user}
        onLogout={handleLogout}
        className="glass"
      />

      {/* ---------- Hero / Slider ---------- */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        {!loading && slides.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            slidesPerView={1}
            loop
            effect="fade"
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            {slides.map((s, i) => (
              <SwiperSlide key={s.id || i}>
                <div className="relative h-72 md:h-96 overflow-hidden">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: activeSlide === i ? 1.04 : 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={s.image || "/placeholder.png"}
                      alt={s.title?.[lang] || "Slide"}
                      fill
                      className="object-cover w-full h-full brightness-90"
                      priority={i === 0}
                      sizes="100vw"
                    />
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute left-6 md:left-12 top-1/3 md:top-1/4 text-left max-w-lg"
                  >
                    <h2 className="text-2xl md:text-4xl font-extrabold heading-gradient">
                      {s.title?.[lang]}
                    </h2>
                    {s.subtitle && <p className="mt-2 text-gray-300 max-w-xl">{s.subtitle?.[lang]}</p>}
                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(s.link || "/sales")}
                        className="px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-lg"
                      >
                        {lang === "ar" ? "تسوق الآن" : "Shop Now"}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-72 rounded-2xl bg-white/5 backdrop-blur-lg flex items-center justify-center">
            <div className="text-gray-300">{mounted ? (lang === "ar" ? "جارٍ تحميل العروض..." : "Loading promotions...") : "Loading..."}</div>
          </div>
        )}
      </section>

      {/* ---------- Search + Categories ---------- */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <div className="relative">
            
             
             
            </div>
          </div>

          <div className="w-full md:w-1/3 flex items-center justify-end gap-3">
            <div className="text-sm text-gray-400">{lang === "ar" ? "تصفح الأقسام" : "Browse categories"}</div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 mt-4">
          {loadingSkeleton
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-28 h-28 rounded-full bg-white/6 animate-pulse" />
              ))
            : categories.length === 0
            ? <div className="text-gray-400">{lang === "ar" ? "لا توجد أقسام" : "No categories"}</div>
            : categories.map((c) => <CategoryPill key={c.id} c={c} lang={lang} />)}
        </div>
      </section>

      {/* ---------- Products by Category ---------- */}
      <section className="max-w-7xl mx-auto px-4 mt-10 space-y-10">
        {categories.map((c) => {
          const list = prodsByCat[c.id] || [];
          const filtered = filterList(list);
          return (
            <div key={c.id} id={`cat-${c.id}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold">{c.name?.[lang]}</h4>
     <button
  onClick={() => router.push(`/sales/${c.id}`)}
  className="text-sm px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-all duration-300 backdrop-blur-md border border-white/10 flex items-center gap-1"
>
  {lang === "ar" ? "عرض الكل" : "View All"}
  <span className="text-lg">→</span>
</button>

              </div>

              <div className="flex gap-4 overflow-x-auto pb-3">
                {loadingSkeleton
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="w-64 h-56 rounded-2xl bg-white/6 animate-pulse" />
                    ))
                  : filtered.length === 0
                  ? <div className="text-gray-400">{lang === "ar" ? "لا توجد منتجات" : "No products"}</div>
                  : filtered.map((p, idx) => (
                      <div key={`${p.id}-${idx}`} className="shrink-0">
                        <ProductCard p={p} onAdd={addToCart} lang={lang} />
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------- Floating Cart Preview ---------- */}
      <div className="fixed right-6 bottom-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/cart")}
          className="flex items-center gap-3 px-4 py-3 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl text-sm font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <circle cx="10" cy="20" r="1" fill="white" />
            <circle cx="18" cy="20" r="1" fill="white" />
          </svg>
          <span>{lang === "ar" ? "العربة" : "Cart"}</span>
          <span className="bg-white/10 px-2 py-1 rounded-full text-xs">{cart.reduce((s, it) => s + (it.qty || 0), 0)}</span>
        </motion.button>
      </div>

      {/* ---------- Footer ---------- */}
      <footer className="mt-16 text-center text-gray-400 py-10 border-t border-white/10">
        <p>{lang === "ar" ? `© ${new Date().getFullYear()} برايت هاوس. كل الحقوق محفوظة.` : `© ${new Date().getFullYear()} Bright House. All rights reserved.`}</p>
      </footer>

      {/* ---------- Inline Styles (move to global CSS/Tailwind when ready) ---------- */}
      <style>{`
        /* Glass / neon helpers */
        .card-glass { 
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); 
          backdrop-filter: blur(8px); 
        }
        .glass {
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(8px);
        }
        .neon-border {
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.06), inset 0 0 10px rgba(0, 229, 255, 0.02);
        }
        .heading-gradient {
          background: linear-gradient(90deg, #00eaff 0%, #6b8cff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Responsive tweaks for horizontal scrollers */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(0,234,255,0.2), rgba(107,140,255,0.2));
          border-radius: 999px;
        }

        /* tiny utility to clamp lines */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
   


















