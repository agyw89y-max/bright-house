"use client";
import { useEffect, useState } from "react";

import { ref, get } from "firebase/database"; 
import { db } from "./firebase/firebase";

import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import { FaWhatsapp, FaFacebook, FaShoppingCart, FaTools } from "react-icons/fa";

export default function Home() {
  const [lang, setLang] = useState("ar"); // default Arabic

const [heroProduct, setHeroProduct] = useState(null);



  const t = {
    ar: {
      heroTitle: "أضِئ عالمك بأناقة وذكاء",
      heroSub:
        "حلول إضاءة ذكية، أدوات كهربائية عالية الجودة، وتركيب وصيانة احترافية تضمن راحتك.",
      explore: "اكتشف منتجاتنا",
      shop: "تسوق الآن",
      service: "اطلب خدمة الآن",
      contact: "تواصل معنا فورًا",
      whatsapp: "واتساب",
      facebook: "فيسبوك",
      salesTitle: "قسم المبيعات المميز",
      salesDesc:
        "منتجات إضاءة أصلية، لمبات LED متطورة، مفاتيح وأسلاك عالية الجودة لضمان تجربة ممتازة.",
      maintTitle: "الصيانة والتركيب الاحترافية",
      maintDesc:
        "فِرَق متخصصة للتركيب، صيانة الأعطال، وفحص الشبكات الكهربائية بدقة وسرعة.",
      ctaTitle: "هل أنت مستعد لتحويل منزلك أو مشروعك؟",
      ctaDesc: "تواصل معنا عبر واتساب الآن للحصول على استشارة أو عرض سريع.",
      footer: "© 2025 Bright House | جميع الحقوق محفوظة",
      customTitle: "مش لاقي المنتج اللي محتاجه؟",
      customDesc: "ولا يهمك! تواصل معنا الآن وسنوفره لك في أسرع وقت ممكن ⚡",
      customBtn: "تواصل معنا الآن",
    },
    en: {
      heroTitle: "Light Up Your World in Style & Smart",
      heroSub:
        "Smart lighting, premium electrical tools, and professional installation & maintenance services.",
      explore: "Explore Products",
      shop: "Shop Now",
      service: "Get Service",
      contact: "Contact Us Now",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      salesTitle: "Premium Sales Department",
      salesDesc:
        "Original lighting products, advanced LED bulbs, switches and wires for a top-notch experience.",
      maintTitle: "Professional Maintenance & Installation",
      maintDesc: "Certified teams for installation, repair, and precise system checks.",
      ctaTitle: "Ready to transform your home or project?",
      ctaDesc: "Contact us now on WhatsApp for a fast quote or consultation.",
      footer: "© 2025 Bright House | All Rights Reserved",
      customTitle: "Can’t find what you’re looking for?",
      customDesc: "No worries! Contact us now and we’ll get it for you in no time ⚡",
      customBtn: "Contact us now",
    },
  }[lang];

useEffect(() => {
  // progressive entrance for non-framer elements
  const els = document.querySelectorAll(".fade-up");
  els.forEach((el, i) => setTimeout(() => el.classList.add("in"), 120 + i * 110));

  // fetch hero product from Firebase
  const fetchHeroProduct = async () => {
    const heroRef = ref(db, "products/heroProduct");
    const snapshot = await get(heroRef);
    if (snapshot.exists()) {
      setHeroProduct(snapshot.val());
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

      {/* HERO */}
      <section className="pt-28 pb-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left - Text */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <img
              src="/logo.png"
              alt="Bright House logo"
              className="w-28 h-auto mx-auto lg:mx-0 mb-6 drop-shadow-[0_10px_30px_rgba(0,215,255,0.08)]"
              loading="lazy"
            />

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 drop-shadow-[0_8px_30px_rgba(0,200,255,0.08)] neon-heading">
              {t.heroTitle}
            </h1>

            <p className="mt-5 text-gray-300 max-w-2xl mx-auto lg:mx-0 text-lg md:text-xl leading-relaxed">
              {t.heroSub}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="/sales"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg font-semibold hover:scale-105 transform transition"
                aria-label={t.explore}
              >
                <FaShoppingCart />
                <span>{t.explore}</span>
              </a>

              <a
                href="/maintenance"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/6 border border-white/8 font-semibold hover:bg-white/10 transition"
                aria-label={t.contact}
              >
                <FaTools />
                <span>{t.contact}</span>
              </a>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <span className="inline-block mr-2">{lang === "ar" ? "تريد مخصص؟" : "Need custom?"}</span>
              <a href="https://wa.me/201000000000" className="underline font-medium">
                {t.customBtn || (lang === "ar" ? "تواصل معنا الآن" : "Contact us now")}
              </a>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1, transition: { duration: 0.8 } }}
              viewport={{ once: true }}
              className="relative w-full max-w-md md:max-w-lg"
            >
           
{heroProduct ? (
  <>
    <img
src="https://res.cloudinary.com/dqp0mtqdn/image/upload/v1755615650/products-images/ti1ev1rmkksea0c9vfft.jpg"
      alt={heroProduct.name}
      className="w-full h-64 object-cover rounded-xl shadow-inner"
      loading="lazy"
    />

    <div className="mt-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-300">{heroProduct.name}</div>
        <div className="font-semibold text-lg text-white">{heroProduct.description}</div>
      </div>

      <div className="text-right">
        <div className="text-xs text-gray-400">Starts at</div>
        <div className="font-bold">EGP {heroProduct.price}</div>
      </div>
    </div>
  </>
) : (
  <p className="text-gray-400 text-center py-24">Loading...</p>
)}

              {/* subtle decorative shine */}
              <div className="pointer-events-none absolute -left-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-tr from-white/6 via-cyan-200/6 to-transparent blur-2xl opacity-30 animate-float"></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Sales + Maintenance */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 grid gap-8 md:grid-cols-2 pb-16">
        <motion.article
          id="sales"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card-glass p-6 relative overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img
              src="/images/sales.jpg"
              alt="Sales products"
              className="w-full md:w-1/2 h-48 object-cover rounded-lg shadow-inner"
              loading="lazy"
            />

            <div className="flex-1">
              <h3 className="text-2xl font-bold neon-heading text-cyan-300">{t.salesTitle}</h3>
              <p className="mt-3 text-gray-300">{t.salesDesc}</p>

              <div className="mt-5">
                <a
                  href="/sales"
                  className="inline-block px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-md hover:scale-105 transition"
                >
                  {t.shop}
                </a>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          id="maintenance"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="card-glass p-6 relative overflow-hidden rounded-2xl"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img
              src="/images/maintenance.jpg"
              alt="Maintenance team"
              className="w-full md:w-1/2 h-48 object-cover rounded-lg shadow-inner"
              loading="lazy"
            />

            <div className="flex-1">
              <h3 className="text-2xl font-bold neon-heading text-blue-300">{t.maintTitle}</h3>
              <p className="mt-3 text-gray-300">{t.maintDesc}</p>

              <div className="mt-5">
                <a
                  href="/maintenance"
                  className="inline-block px-5 py-3 rounded-full bg-white/6 border border-white/8 font-semibold shadow-sm hover:scale-105 transition"
                >
                  {t.service}
                </a>
              </div>
            </div>
          </div>
        </motion.article>
      </section>

      {/* Custom Request Section */}
      <section className="relative py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-10 rounded-3xl backdrop-blur-2xl border border-cyan-400/12 bg-gradient-to-br from-[#001026]/60 to-[#002440]/50 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 neon-heading">
                {t.customTitle}
              </h3>
              <p className="text-gray-300 mt-3">{t.customDesc}</p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-[0_12px_30px_rgba(37,211,102,0.12)] hover:scale-105 transition"
                aria-label={t.customBtn}
              >
                <FaWhatsapp />
                <span>{t.customBtn}</span>
              </a>
            </div>
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
              href="https://wa.me/201000000000"
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

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 border-t border-white/8">
        <div className="mb-4 flex justify-center gap-3 flex-wrap">
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 transition"
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp /> {t.whatsapp}
          </a>
          <a
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 transition"
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
          >
            <FaFacebook /> {t.facebook}
          </a>
        </div>
        <div className="text-sm">{t.footer}</div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        className="fixed bottom-6 right-6 fab z-50"
        href="https://wa.me/201000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
          <FaWhatsapp size={22} />
        </div>
      </a>
    </main>
  );

}   