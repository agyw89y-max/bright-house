"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ref, get } from "firebase/database"; 
import { db } from "./firebase/firebase";

import { FaWhatsapp, FaFacebook, FaShoppingCart, FaTools } from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";


import {
  Shield, BadgeCheck, PackageCheck, Award,
  Gem, Wrench, Timer, Lightbulb, ShieldCheck, Sparkles
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";





export function DetailsToggle({ detailsItems, showLabel = { show: "عرض التفاصيل أكثر", hide: "إخفاء التفاصيل" } }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setShow(!show)}
        className="text-cyan-300 font-semibold hover:underline flex items-center gap-2"
      >
        {show ? showLabel.hide : showLabel.show}
        <span className="text-lg">{show ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-gray-300 text-sm border-l-2 border-cyan-400 pl-3"
          >
            <ul className="list-disc list-inside space-y-1">
              {detailsItems.map((item) => (
  <li key={item}>{item}</li>

              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}





const customImages = [
  { src: "/images/custom-linear.jpg", alt: "لينيرات مخصصة 1", title: "شكل A" },
  { src: "/images/custom-linear1.jpg", alt: "لينيرات مخصصة 2", title: "شكل B" },
  { src: "/images/custom-linear2.jpg", alt: "لينيرات مخصصة 3", title: "شكل C" },
  { src: "/images/custom-linear3.jpeg", alt: "لينيرات مخصصة 4", title: "شكل D" },
];











export default function Home() {
  const [lang, setLang] = useState("ar");
  const [heroProduct, setHeroProduct] = useState(null);


const [user, setUser] = useState("loading");




const salesDetails = {
  ar: [
    "ضمان 3 سنوات على جميع منتجات الماجنتيك.",
    "جودة أصلية لا تقارن بأي منتج آخر.",
    "خدمة عملاء سريعة واستجابة فورية.",
    "منتجات أصلية مع أفضل أداء وموثوقية.",
    "توصيل سريع ومريح لجميع أنحاء مصر.",
  ],
  en: [
    "3-year warranty on all magnetic lighting products.",
    "Original high-quality products that cannot be compared.",
    "Fast customer support and instant response.",
    "Original products with the best performance and reliability.",
    "Fast and convenient delivery across Egypt.",
  ],
};

const maintenanceDetails = {
  ar: [
    "فِرَق فنية معتمدة ومحترفة.",
    "تفقد شامل لجميع الأعطال والمعدات.",
    "صيانة دقيقة وسريعة لضمان أفضل أداء.",
    "لا يشمل أي ضمان على المعدات أو القطع.",
    "خدمة عملاء متاحة للرد على جميع الاستفسارات.",
  ],
  en: [
    "Certified professional technical teams.",
    "Comprehensive inspection of all faults and equipment.",
    "Precise and fast maintenance for optimal performance.",
    "No warranty included on equipment or parts.",
    "Customer service available for all inquiries.",
  ],
};

const t = {
  ar: {
    heroTitle: "أضِئ حياتك... بأسلوب ذكي وفخم!",
    heroSub:
      "نوفر لك كل ما تحتاجه من الإضاءة والديكور إلى التركيب والصيانة، بخدمة موثوقة وجودة تفوق التوقعات.",
    explore: "اكتشف منتجاتنا",
    shop: "تسوق الآن",
    service: "اطلب خدمة الآن",
    contact: "تواصل معنا فورًا",
    whatsapp: "واتساب",
    facebook: "فيسبوك",
    salesTitle: "قسم المبيعات المميز",
    salesDesc:
      "إضاءة أصلية، لمبات LED متطورة، مفاتيح وأسلاك عالية الجودة لتجربة أداء لا مثيل لها.",
    maintTitle: "التركيب والصيانة الاحترافية",
    maintDesc:
      "فِرَق فنية متخصصة في التركيب، إصلاح الأعطال، وفحص الشبكات الكهربائية بدقة وسرعة عالية.",
    ctaTitle: "جاهز لتحويل بيتك أو مشروعك لمكان ينبض بالأناقة؟",
    ctaDesc: "تواصل معنا عبر واتساب الآن للحصول على عرض أو استشارة فورية.",
    footer: "© 2025 Bright House | جميع الحقوق محفوظة",
    customTitle: "مش لاقي المنتج اللي محتاجه؟",
    customDesc: "ولا تشيل هم! تواصل معنا وسنوفره لك بأسرع وقت ⚡",
    customBtn: "تواصل معنا الآن",

    maintenanceBtn: "احجز خدمة الصيانة الآن",
    detailsToggleShow: "عرض التفاصيل أكثر",
    detailsToggleHide: "إخفاء التفاصيل",
    warrantyBadge: "ضمان 3 سنوات على جميع منتجات الماجنتيك",
    certifiedBadge: "فريق معتمد",
  },

  en: {
    heroTitle: "Light Up Your Life with Smart Elegance!",
    heroSub:
      "From lighting and décor to installation and maintenance — we deliver trusted service and unmatched quality.",
    explore: "Explore Products",
    shop: "Shop Now",
    service: "Get Service",
    contact: "Contact Us Now",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    salesTitle: "Premium Sales Department",
    salesDesc:
      "Original lighting solutions, advanced LED bulbs, and high-quality switches & cables for an exceptional experience.",
    maintTitle: "Professional Installation & Maintenance",
    maintDesc:
      "Expert teams specialized in installation, repairs, and precise electrical inspections.",
    ctaTitle: "Ready to transform your home or project?",
    ctaDesc: "Contact us now via WhatsApp for a quick quote or consultation.",
    footer: "© 2025 Bright House | All Rights Reserved",
    customTitle: "Can’t find what you’re looking for?",
    customDesc: "No worries! Contact us now and we’ll provide it in no time ⚡",
    customBtn: "Contact us now",

    maintenanceBtn: "Book Maintenance Service",
    detailsToggleShow: "Show More Details",
    detailsToggleHide: "Hide Details",
    warrantyBadge: "3-Year Warranty on All Magnetic Products",
    certifiedBadge: "Certified Team",
  },
}[lang];






useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  });

  return () => unsubscribe();
}, []);


useEffect(() => {
  // progressive entrance for non-framer elements
  const els = document.querySelectorAll(".fade-up");
  els.forEach((el, i) => setTimeout(() => el.classList.add("in"), 120 + i * 110));

  // fetch hero product from Firebase
  const fetchHeroProduct = async () => {
    const heroRef = ref(db, "heroProduct");
    try {
      const snapshot = await get(heroRef);
      if (snapshot.exists()) {
        setHeroProduct(snapshot.val());
      }
    } catch (err) {
      console.error("فشل جلب بيانات المنتج:", err);
    }
  };

  fetchHeroProduct();
}, []);


  // framer variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <main
      className={`${lang === "ar" ? "direction-rtl" : ""} bg-[#041029] min-h-screen text-gray-200`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((s) => (s === "ar" ? "en" : "ar"))}
        logo="/logo.png"
      />

      {/* Decorative background layers (subtle, stacked) */}
      <div aria-hidden className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -left-40 top-8 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,#00d8ff22,transparent)] blur-3xl opacity-50 animate-slowPulse"></div>
        <div className="absolute right-10 bottom-28 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,#ffd16618,transparent)] blur-3xl opacity-40 animate-slowPulse delay-200"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00122666] to-[#00081488] pointer-events-none"></div>
      </div>



    <Navbar
      lang={lang}
      onToggleLang={() => setLang((s) => (s === "ar" ? "en" : "ar"))}
      logo="/logo.png"
      user={user}
      onLogout={() => {
        auth.signOut();
        setUser(null);
      }}
    />
 






{/* HERO SECTION */}
<section className="relative overflow-hidden pt-28 pb-16">
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
    variants={fadeInUp}
    className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-center items-center text-center"
  >
    <div className="relative z-10 max-w-2xl">

      {/* LOGO */}
      <motion.img
        src="/logo.png"
        alt="Bright House logo"
        loading="lazy"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-32 h-auto mx-auto mb-8 
                   backdrop-blur-md bg-white/10 border border-white/10 
                   rounded-full p-3 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"
      />

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight 
                   text-transparent bg-clip-text 
                   bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 
                   drop-shadow-[0_0_25px_rgba(0,200,255,0.25)] 
                   tracking-tight neon-heading"
      >
        {t.heroTitle}
      </motion.h1>

      {/* SUBTITLE */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-6 text-gray-300/90 text-lg md:text-xl leading-relaxed backdrop-blur-sm"
      >
        {t.heroSub}
      </motion.p>

      {/* BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <a
          href="/sales"
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full 
                     bg-gradient-to-r from-cyan-500 to-blue-500 
                     shadow-[0_0_25px_rgba(0,200,255,0.35)] 
                     font-semibold text-white 
                     hover:scale-105 hover:shadow-[0_0_35px_rgba(0,230,255,0.45)] 
                     active:scale-95 transition-all duration-300"
        >
          <FaShoppingCart className="text-lg" />
          <span>{t.explore}</span>
        </a>

        <a
          href="/maintenance"
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full 
                     bg-white/5 border border-white/10 
                     text-gray-200 font-semibold 
                     hover:bg-white/10 hover:border-cyan-400/40 
                     transition-all duration-300"
        >
          <FaTools className="text-lg" />
          <span>{t.contact}</span>
        </a>
      </motion.div>

      {/* CUSTOM ORDER LINK */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-6 text-sm text-gray-400"
      >
        <span className="inline-block mr-2">
          {lang === "ar" ? "تريد تصميم مخصص؟" : "Need something special?"}
        </span>
        <a
          href="https://wa.me/20111656958"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:text-cyan-300 transition"
        >
          {t.customBtn || (lang === "ar" ? "تواصل معنا الآن" : "Contact us now")}
        </a>
      </motion.div>
    </div>
  </motion.div>
</section>




     









{/* Sales + Maintenance */}
 {/* Sales + Maintenance */}
       {/* Sales Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 grid gap-8 md:grid-cols-2 pb-16">
        <motion.article
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card-glass p-6 relative overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-1/2">
              <img src="/images/sales.jpg" alt="Sales products" className="w-full h-48 object-cover rounded-lg shadow-inner" />
              <div className="absolute top-3 left-3 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <FaShoppingCart className="w-3 h-3" />
                {t.warrantyBadge}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold neon-heading text-cyan-300">{t.salesTitle}</h3>
              <p className="mt-3 text-gray-300 flex items-center gap-2">{t.salesDesc}</p>
         <DetailsToggle detailsItems={salesDetails[lang]} />


              <div className="mt-5">
                <a href="/sales" className="inline-block px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-md hover:scale-105 transition">{t.shop}</a>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Maintenance Section */}
        <motion.article
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card-glass p-6 relative overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-1/2">
              <img src="/images/maintenance.png" alt="Maintenance team" className="w-full h-48 object-cover rounded-lg shadow-inner" />
              <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <FaTools className="w-3 h-3" />
                {t.certifiedBadge}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold neon-heading text-blue-300">{t.maintTitle}</h3>
              <p className="mt-3 text-gray-300 flex items-center gap-2">{t.maintDesc}</p>
                  <DetailsToggle detailsItems={maintenanceDetails[lang]} />


              <div className="mt-5">
                <a href="/maintenance" className="inline-block px-5 py-3 rounded-full bg-white/6 border border-white/8 font-semibold shadow-sm hover:scale-105 transition">{t.maintenanceBtn}</a>
              </div>
            </div>
          </div>
        </motion.article>         



      </section>







{/* Custom Request Section - Enhanced */}
<section className="relative py-24 px-6 bg-gradient-to-b from-[#001026] to-[#000814] overflow-hidden">
  {/* Glow Background Circles */}
  <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-400/30 via-blue-400/20 to-transparent blur-3xl animate-float pointer-events-none"></div>
  <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-green-400/20 via-emerald-400/10 to-transparent blur-3xl animate-pulse pointer-events-none"></div>

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
    viewport={{ once: true }}
    className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 p-14 rounded-3xl backdrop-blur-3xl border border-cyan-400/20 bg-white/5 shadow-[0_25px_50px_rgba(0,255,255,0.2),0_0_100px_rgba(0,200,255,0.1)] hover:shadow-[0_30px_70px_rgba(0,255,255,0.25),0_0_120px_rgba(0,200,255,0.15)] transition-shadow duration-500"
  >
    {/* Left Text */}
    <div className="flex-1 text-center md:text-left space-y-4">
      <h3 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 neon-heading leading-snug drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
        {lang === "ar"
          ? "مش لاقي المنتج اللي بتدور عليه؟"
          : "Can't find the product you're looking for?"}
      </h3>
      <p className="text-gray-300 text-lg md:text-xl drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
        {lang === "ar"
          ? "تواصل معنا وسنوفرهولك بأسرع وقت ⚡"
          : "Contact us and we'll provide it in no time ⚡"}
      </p>
    </div>

    {/* Right Button */}
    <div className="flex-shrink-0 relative">
      <a
        href="https://wa.me/20111656958"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold shadow-[0_15px_40px_rgba(37,211,102,0.25),0_0_60px_rgba(0,255,200,0.15)] hover:scale-110 hover:shadow-[0_20px_60px_rgba(37,211,102,0.35),0_0_80px_rgba(0,255,200,0.2)] transition-transform duration-300 animate-pulse"
        aria-label={t.customBtn}
      >
        <FaWhatsapp size={26} className="drop-shadow-lg" />
        <span className="text-xl">{lang === "ar" ? "تواصل معنا الآن" : "Contact us now"}</span>
      </a>
    </div>
  </motion.div>
</section>





































{/* Custom Linear Lights Section */}
<section className="relative py-20 px-6 bg-gradient-to-b from-[#000814] to-[#001026]">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
    viewport={{ once: true }}
    className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start gap-12 p-12 rounded-3xl backdrop-blur-3xl border border-cyan-400/20 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.8)] transition-shadow duration-500"
  >
    {/* Left - Text + Points */}
    <div className="flex-1 space-y-6">
      <h3 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 neon-heading leading-snug">
        {lang === "ar" ? "اسأل عن الينيرات حسب طلبك" : "Custom Linear Lights Made for You"}
      </h3>
      <p className="text-gray-300 text-lg md:text-xl">
        {lang === "ar"
          ? "نقوم بصناعة أي شكل تريده من الينيرات بجودة عالية وخامات ممتازة."
          : "We craft any linear light shape you want with top-quality materials and premium LED profiles."}
      </p>

      <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
        <li>{lang === "ar" ? "خامات عالية الجودة" : "High-quality materials"}</li>
        <li>{lang === "ar" ? "ليد بروفيل عالي الأداء" : "Premium LED profiles"}</li>
        <li>{lang === "ar" ? "تصميم حسب الطلب" : "Custom design per your request"}</li>
        <li>{lang === "ar" ? "تشطيب احترافي ومتين" : "Professional and durable finish"}</li>
        <li>{lang === "ar" ? "ضمان أداء ممتاز" : "Guaranteed top performance"}</li>
      </ul>
    </div>

    {/* Right - Image Carousel */}
   {/* Right - Image Carousel */}
<div className="flex-shrink-0 w-full max-w-xl relative">
  <div className="flex overflow-x-auto gap-4 py-4 snap-x snap-mandatory scroll-smooth">
    {customImages.map((img, idx) => (
      <div
        key={idx}
        className="flex-shrink-0 w-full md:w-[320px] rounded-3xl overflow-hidden relative snap-center shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <img
          src={img.src}
          alt={img.alt}
          className="w-full h-auto object-contain rounded-3xl"
        />
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-sm px-3 py-1 rounded-lg shadow-md">
          {img.title}
        </div>
      </div>
    ))}
  </div>

  {/* Glow Effects */}
  <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-300/20 via-blue-400/10 to-transparent blur-3xl opacity-50 animate-float"></div>
  <div className="pointer-events-none absolute -bottom-10 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/10 via-blue-600/10 to-transparent blur-3xl opacity-40 animate-pulse"></div>
</div>

  </motion.div>
</section>







































{/* Why Choose Us Section */}
<section className="relative py-20 px-6 bg-gradient-to-b from-[#001026] to-[#000814] overflow-hidden">
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
    viewport={{ once: true }}
    className="max-w-6xl mx-auto text-center"
  >
    <h3 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 neon-heading">
      {lang === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
    </h3>
    <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-12">
      {lang === "ar"
        ? "نضمن لك أعلى جودة في المنتجات والخدمات، مع دقة في التنفيذ واهتمام بأدق التفاصيل."
        : "We guarantee top quality products and services with precision and attention to every detail."}
    </p>

    {/* ⚡ Scrollable Horizontal Container with Snap */}
    <div className="flex gap-6 overflow-x-auto px-4 py-4 snap-x snap-mandatory scrollbar-hide">
      {[
        {
          icon: <Gem className="w-10 h-10 text-cyan-400" />,
          text: { ar: "خامات أصلية وجودة مضمونة", en: "Premium Materials & Quality" },
          key: "materials",
        },
        {
          icon: <Wrench className="w-10 h-10 text-green-400" />,
          text: { ar: "فريق صيانة معتمد ومحترف", en: "Certified Professional Technicians" },
          key: "technicians",
        },
        {
          icon: <Timer className="w-10 h-10 text-yellow-400" />,
          text: { ar: "تنفيذ سريع وتسليم في الموعد", en: "Fast Execution & On-Time Delivery" },
          key: "fast",
        },
      ].map((item) => (
        <motion.div
          key={item.key}
          whileHover={{ scale: 1.05 }}
          className="flex-none w-64 snap-center flex flex-col items-center justify-center text-center
                     p-6 rounded-3xl backdrop-blur-2xl bg-white/5 border border-blue-400/10
                     shadow-[0_0_40px_rgba(0,255,255,0.05)] transition-transform duration-300"
        >
          <div className="flex justify-center mb-4">{item.icon}</div>
          <p className="text-gray-300 text-lg font-medium">{lang === "ar" ? item.text.ar : item.text.en}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>














{/* 🛡️ قسم الثقة والثبات */}
<section className="relative py-20 px-6 bg-gradient-to-b from-[#000814] to-[#00111f] overflow-hidden">
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
    viewport={{ once: true }}
    className="max-w-6xl mx-auto text-center"
  >
    <h2 className="text-4xl md:text-5xl font-extrabold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 neon-heading">
      {lang === "ar" ? "ثقة وجودة لا تقارن" : "Unmatched Trust & Quality"}
    </h2>

    {/* ⚡ Scrollable Horizontal Container with Snap */}
    <div className="flex gap-6 overflow-x-auto px-4 py-4 snap-x snap-mandatory scrollbar-hide">
      {[
        {
          icon: <BadgeCheck className="w-10 h-10 text-green-400" />,
          text: { ar: "منتجات معتمدة من Bright House", en: "Certified Bright House Products" },
          key: "certified",
        },
        {
          icon: <PackageCheck className="w-10 h-10 text-yellow-400" />,
          text: { ar: "خدمة ما بعد البيع ممتازة", en: "Excellent After-Sales Service" },
          key: "after-sales",
        },
        {
          icon: <Award className="w-10 h-10 text-blue-400" />,
          text: { ar: "ثقة عملائنا هي رأس مالنا", en: "Customer Trust is Our Capital" },
          key: "customer-trust",
        },
      ].map((item) => (
        <motion.div
          key={item.key}
          whileHover={{ scale: 1.05 }}
          className="flex-none w-64 snap-center flex flex-col items-center justify-center text-center
                     p-6 rounded-2xl backdrop-blur-2xl bg-white/5 border border-cyan-400/10
                     shadow-[0_0_30px_rgba(0,255,255,0.05)] transition-transform duration-300"
        >
          <div className="flex justify-center mb-4">{item.icon}</div>
          <p className="text-gray-300 text-lg">{lang === "ar" ? item.text.ar : item.text.en}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>













































      {/* CTA */}
      <section className="py-12 px-6">
        <motion.div
          className="max-w-3xl mx-auto card-glass p-8 rounded-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-3 neon-heading">{t.ctaTitle}</h3>
          <p className="text-gray-300 mb-6">{t.ctaDesc}</p>

          <div className="flex gap-3 justify-center">
            <a
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-green-500 font-bold shadow-lg hover:scale-105 transition"
              href="https://wa.me/20111656958"
              target="_blank"
              rel="noreferrer"
            >
           
              <FaWhatsapp /> {t.whatsapp}
            </a>
            <a
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 font-bold shadow-lg hover:scale-105 transition"
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebook /> {t.facebook}
            </a>
          </div>
        </motion.div>
      </section>


      {/* Floating WhatsApp */}
      <a
        className="fixed bottom-6 right-6 fab z-50"
        href="https://wa.me/20111656958"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
          <FaWhatsapp size={22} />
        </div>
      </a>




      
      
        <Footer lang={lang} /> {/* ✅ هنا مكانه الصحيح */}
      
    </main>
  );

}   