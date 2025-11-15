"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar"; // عدّل المسار حسب موقعك

// أيقونات من lucide-react (استخدمها بدل react-icons)
import { Wrench, Search, Cpu, CheckCircle, Users, Clock } from "lucide-react";
import { FaTools, FaLightbulb, FaPlug, FaBolt, FaWhatsapp, FaFacebook } from "react-icons/fa";

// لو حابب تستخدم react-icons فا مش مشكلة، بس لو مش بتستعملها احذف السطر ده
// import { FaWhatsapp, FaFacebook, FaTools, FaLightbulb, FaPlug, FaBolt } from "react-icons/fa";

// كائن الأيقونات
const icons = { Wrench, Search, Cpu, CheckCircle, Users, Clock };





export default function Maintenance() {
  const [lang, setLang] = useState("ar");
  const [scrollY, setScrollY] = useState(0);

  // متابعة التمرير للـ Parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


const translations = {
  ar: {






trustSection: {
  title: "ثقة تستحقها ",
  subtitle: "الجودة والاحترافية في كل خدمة نقدمها",
  tagline: "نلتزم بالجودة ونصنع الفرق في كل خدمة نقدمها للحفاظ على ثقتكم.",
  items: [
    {
      title: "قطع غيار أصلية 100%",
      desc: "نستخدم فقط القطع الأصلية المعتمدة للحفاظ على أداء جهازك وجودته.",
      icon: "Wrench",
    },
    {
      title: "فريق صيانة محترف",
      desc: "مهندسون وفنيون بخبرة عالية في جميع أنواع الأجهزة.",
      icon: "Users",
    },
    {
      title: "الالتزام بالمواعيد",
      desc: "نضمن لك سرعة التنفيذ دون المساس بالجودة لأن وقتك ثمين.",
      icon: "Clock",
    },
  ],
},
howWeWorkIntro: "نعمل بخطوات مدروسة ومنظمة تضمن لك أعلى جودة في الصيانة وأفضل تجربة مع فريقنا المتخصص.",

    heroTitle: "صيانة الكشافات الليد",
    heroSub: "نقدم صيانة احترافية لجميع أنواع الكشافات مع ضمان الجودة والاستجابة السريعة.",
    servicesTitle: "خدماتنا",
    servicesDesc: "استعرض خدمات الصيانة والتركيب المتخصصة للكشافات.",
    services: [
      {
        title: "صيانة عامة للكشافات",
        desc: "صيانة شاملة واستعادة الأداء الأصلي للكشاف.",
        icon: FaTools,


        glow: "from-yellow-400 via-yellow-300 to-yellow-200",
      },
      {
        title: "تركيب الكشافات",
        desc: "تركيب جميع كشفات اليد.",
        icon: FaLightbulb,
        glow: "from-orange-400 via-orange-300 to-yellow-300",
      },
      {
        title: "تركيب لينيرات",
        desc: "تركيب و تجميع جميع اشكال النيارات.",
        icon: FaPlug,
        glow: "from-cyan-400 via-blue-400 to-cyan-300",
      },
      {
        title: "تركيب ماجنتيك",
        desc: "تركيب جميع انواع الماجنتيك.",
        icon: FaBolt,
        glow: "from-purple-400 via-pink-400 to-purple-300",
      },
    ],
    howWeWorkTitle: "كيف نعمل",
    howWeWorkSteps: [
      "تقييم الكشاف وفحصه بالكامل",
      "تحديد الأعطال المطلوبة للإصلاح",
      "إصلاح واستبدال القطع التالفة",
      "اختبار الأداء والتسليم للعميل",
    ],
    whatsapp: "واتساب",
    facebook: "فيسبوك",
    footer: "© 2025 Bright House | جميع الحقوق محفوظة",
    faq: [
      {
        question: "كم تستغرق صيانة الكشاف؟",
        answer: "عادةً تستغرق الصيانة الكاملة من 1 إلى 3 أيام حسب نوع الكشاف وحجمه.",
      },
      {
        question: "هل تقدمون ضمان بعد الصيانة؟",
        answer: "نعم، جميع أعمال الصيانة تأتي مع ضمان لمدة 3 أشهر على القطع المستبدلة.",
      },
      {
        question: "هل يمكن تركيب الكشافات في الموقع؟",
        answer: "نعم، نقدم خدمة التركيب في موقع العميل مع جميع المعدات اللازمة.",
      },
      {
        question: "كيف يمكن التواصل معكم للطوارئ؟",
        answer: "يمكنك التواصل معنا عبر واتساب أو الهاتف في أي وقت، ونستجيب بسرعة فائقة.",
      },
    ],
  },

  en: {












howWeWorkIntro: "We follow a carefully structured process to ensure top-quality maintenance and a seamless experience with our expert team.",


    trustSection: {
  title: "Trust You Deserve ",
  subtitle: "Quality and professionalism in every service",
  tagline: "We are committed to excellence and building lasting trust with every service.",
  items: [
    {
      title: "100% Genuine Spare Parts",
      desc: "We use only certified original parts to ensure long-lasting performance and quality.",
      icon: "Wrench",
    },
    {
      title: "Professional Maintenance Team",
      desc: "Certified engineers and experienced technicians specialized in all device types.",
      icon: "Users",
    },
    {
      title: "On-Time Commitment",
      desc: "We value your time — fast, reliable service without compromising quality.",
      icon: "Clock",
    },
  ],
},

    heroTitle: "LED Spotlights Maintenance",
    heroSub: "We provide professional maintenance for all types of spotlights with guaranteed quality and fast response.",
    servicesTitle: "Our Services",
    servicesDesc: "Check out our specialized maintenance and installation services.",
    services: [
      {
        title: "General Spotlight Maintenance",
        desc: "Comprehensive maintenance and restoring original performance of the spotlight.",
        icon: FaTools,


        glow: "from-yellow-400 via-yellow-300 to-yellow-200",
      },
      {
        title: "Spotlight Installation",
        desc: "Installation of all handheld spotlights.",
        icon: FaLightbulb,
        glow: "from-orange-400 via-orange-300 to-yellow-300",
      },
      {
        title: "Linear Lights Installation",
        desc: "Install and assemble all types of linear lights.",
        icon: FaPlug,
        glow: "from-cyan-400 via-blue-400 to-cyan-300",
      },
      {
        title: "Magnetic Installation",
        desc: "Installation of all types of magnetic lights.",
        icon: FaBolt,
        glow: "from-purple-400 via-pink-400 to-purple-300",
      },
    ],
    howWeWorkTitle: "How We Work",
    howWeWorkSteps: [
      "Evaluate the spotlight thoroughly",
      "Identify faults for repair",
      "Repair or replace damaged parts",
      "Test performance and deliver to customer",
    ],
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    footer: "© 2025 Bright House | All Rights Reserved",
    faq: [
      {
        question: "How long does spotlight maintenance take?",
        answer: "Full maintenance usually takes 1 to 3 days depending on the type and size of the spotlight.",
      },
      {
        question: "Do you provide a warranty after maintenance?",
        answer: "Yes, all maintenance work comes with a 3-month warranty on replaced parts.",
      },
      {
        question: "Can spotlights be installed on-site?",
        answer: "Yes, we provide on-site installation service with all necessary equipment.",
      },
      {
        question: "How can I contact you in case of emergency?",
        answer: "You can contact us via WhatsApp or phone at any time, and we respond very quickly.",
      },
    ],
  },
};

const t = translations[lang];

  const stars = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${0.8 + Math.random() * 2}s`,
    }));
  }, []);

  const fadeInUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } };

  return (
    <main className="bg-[#041029] text-gray-200 min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")} logo="/logo.png" />



{/* 🔹 Hero Section - بخلفية صورة ظاهرة بوضوح */}
{/* 🔹 Hero Section - بخلفية صورة */}
{/* 🔹 Hero Section - Ultimate Pro (Clean & Modern) */}

{/* Hero Section - Ultimate Pro Version */}
{/* Hero Section - Ultimate Pro Version */}
<section
  className="relative flex flex-col items-center justify-center text-center min-h-[100vh] px-6 overflow-hidden z-10"
  style={{
    transform: `translateY(${scrollY * 0.1}px)`,
    transition: "transform 0.2s ease-out",
  }}
>
  {/* 🔹 الخلفية بالصورة والتدرج */}
<div className="absolute inset-0 -z-10">
  {/* الخلفية */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/maintenance.png')",
      filter: "brightness(0.6) contrast(1.1)",
    }}
  ></div>

  {/* Overlay تدرجي بسيط */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#000]/40 to-[#02152f]/70"></div>

 </div>

  {/* تأثيرات توهج */}
  <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/30 blur-[120px] rounded-full animate-pulse" />
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-700/30 blur-[100px] rounded-full animate-pulse delay-1000" />

  {/* العنوان */}
  <motion.h1
    variants={fadeInUp}
    initial="hidden"
    animate="show"
    transition={{ duration: 1 }}
    className="text-5xl md:text-6xl font-extrabold text-cyan-300 mb-6 leading-tight drop-shadow-[0_0_35px_rgba(0,255,255,0.8)] animate-[glow_3s_ease-in-out_infinite_alternate]"
    style={{ fontFamily: 'Cairo, sans-serif' }}
  >
    {t.heroTitle}
  </motion.h1>

  {/* الوصف */}
  <motion.p
    variants={fadeInUp}
    initial="hidden"
    animate="show"
    transition={{ delay: 0.2, duration: 1 }}
    className="max-w-2xl mx-auto text-gray-300 mb-10 text-lg md:text-xl leading-relaxed"
  >
    {t.heroSub}
  </motion.p>

  {/* الأزرار */}
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="show"
    transition={{ delay: 0.4, duration: 1 }}
    className="flex justify-center gap-5 flex-wrap"
  >
    <a
      href="#services"
      className="relative px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] hover:scale-110 transition-all duration-300"
    >
      <span className="relative z-10">{t.servicesTitle}</span>
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-xl opacity-50 animate-pulse"></span>
    </a>

    <a
      href="https://wa.me/201116565958"
      target="_blank"
      rel="noreferrer"
      className="relative px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_25px_rgba(0,255,100,0.3)] hover:shadow-[0_0_50px_rgba(0,255,100,0.6)] hover:scale-110 transition-all duration-300 flex items-center gap-2"
    >
      <FaWhatsapp className="text-2xl animate-pulse" />
      <span className="relative z-10">{t.whatsapp}</span>
      <span className="absolute inset-0 rounded-full bg-green-500 blur-xl opacity-40 animate-pulse"></span>
    </a>
  </motion.div>

  {/* سهم تمرير للأسفل */}
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.2, duration: 1 }}
    className="absolute bottom-10 flex flex-col items-center cursor-pointer"
  >
    <span className="text-gray-400 text-sm mb-2">مرر للأسفل</span>
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="w-8 h-8 border-2 border-cyan-400 rounded-full flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-cyan-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </motion.div>
  </motion.div>

  {/* أنيميشن التوهج للنص */}
  <style jsx>{`
    @keyframes glow {
      from {
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5),
          0 0 20px rgba(0, 255, 255, 0.3);
      }
      to {
        text-shadow: 0 0 30px rgba(0, 255, 255, 0.9),
          0 0 60px rgba(0, 255, 255, 0.6);
      }
    }
  `}</style>
</section>  








      {/* Services Section */}
   {/* Services Section */}
{/* Services Section */}
<section id="services" className="py-16 px-6 max-w-6xl mx-auto relative z-10">
  <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4 text-center drop-shadow-[0_0_25px_rgba(0,255,255,0.8)]">
    {t.servicesTitle}
  </h2>
  <p className="text-gray-300 text-center mb-12">{t.servicesDesc}</p>

  <div className="relative">
    {/* أزرار التنقل (تظهر فوق الكروت في الموبايل) */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        className="bg-cyan-500/20 hover:bg-cyan-500/40 p-2 rounded-full text-cyan-300 transition-all duration-300 active:scale-90"
        onClick={() =>
          document.getElementById('services-scroll').scrollBy({ left: -300, behavior: 'smooth' })
        }
      >
        ‹
      </button>
      <button
        className="bg-cyan-500/20 hover:bg-cyan-500/40 p-2 rounded-full text-cyan-300 transition-all duration-300 active:scale-90"
        onClick={() =>
          document.getElementById('services-scroll').scrollBy({ left: 300, behavior: 'smooth' })
        }
      >
        ›
      </button>
    </div>

    {/* الكروت */}
    <div
      id="services-scroll"
      className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 gap-8 scrollbar-hide scroll-smooth snap-x snap-mandatory"
    >
      {t.services.map((service, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
          className="flex-shrink-0 w-72 sm:w-auto snap-center relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 text-center shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:shadow-[0_0_60px_rgba(0,255,255,0.4)] hover:scale-105 transition-transform border border-white/10"
        >
          <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center group">
            <service.icon className="text-5xl text-white z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-500 group-hover:scale-110" />
            <span className={`absolute inset-0 rounded-full bg-gradient-to-tr ${service.glow} opacity-40 blur-xl animate-pulse group-hover:opacity-70`} />
            <span className={`absolute inset-0 rounded-full bg-gradient-to-tr ${service.glow} opacity-30 blur-2xl animate-pulse delay-200 group-hover:opacity-60`} />
            {[...Array(6)].map((_, j) => (
              <span
                key={j}
                className="absolute w-1 h-6 bg-white/60 rounded-full animate-bounce transition-all duration-500 group-hover:h-10 group-hover:bg-white/80"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${0.8 + Math.random()}s`,
                  animationDelay: `${Math.random()}s`,
                }}
              />
            ))}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{service.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>







<section className="relative py-20 px-6 overflow-hidden bg-gradient-to-b from-[#0a1a2f] to-[#081020]">
  {/* العنوان الرئيسي */}
  <motion.h2
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="text-3xl md:text-4xl font-extrabold text-center text-cyan-400 mb-4 drop-shadow-[0_0_25px_rgba(0,255,255,0.7)]"
    style={{ fontFamily: "Cairo, sans-serif" }}
  >
    {t.howWeWorkTitle}
    <span className="block text-base md:text-lg text-gray-400 mt-2">
      {lang === "ar" ? "خطوات عملنا بكل احترافية" : "Our professional workflow"}
    </span>
  </motion.h2>

  {/* الفقرة التعريفية */}
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.8 }}
    className="text-gray-300 text-center max-w-2xl mx-auto mb-12 text-lg leading-relaxed"
  >
    {t.howWeWorkIntro}
  </motion.p>

  {/* الخط الزمني */}
  <div className="max-w-3xl mx-auto relative">
    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent h-full blur-[1px] opacity-70" />

    <div className="flex flex-col gap-12 relative z-10">
      {t.howWeWorkSteps.map((step, index) => {
        // ترتيب الأيقونات حسب الخطوات
        const stepIconsExplicit = [Wrench, Cpu, Users, CheckCircle];
        const IconComp = stepIconsExplicit[index % stepIconsExplicit.length];
        const isEven = index % 2 === 0;
        const rtlRowReverse =
          lang === "ar"
            ? isEven
              ? "flex-row-reverse text-right"
              : "text-left"
            : isEven
            ? "text-left"
            : "flex-row-reverse text-right";

        // تحديد لون خاص للخطوة الرابعة
        const isFinalStep = index === 3;
        const iconColor = isFinalStep ? "from-emerald-400 to-green-500" : "from-cyan-400 to-blue-500";
        const iconGlow = isFinalStep
          ? "shadow-[0_0_30px_rgba(0,255,120,0.7)]"
          : "shadow-[0_0_25px_rgba(0,255,255,0.6)]";

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, scale: isFinalStep ? 0.8 : 1 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.18,
              type: "spring",
              stiffness: 100,
              duration: isFinalStep ? 0.8 : 0.6,
            }}
            viewport={{ once: true }}
            className={`relative flex items-center gap-6 ${rtlRowReverse}`}
          >
            {/* أيقونة متوهجة */}
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{
                  scale: 1.3,
                  opacity: 1,
                  transition: { duration: 0.4, delay: index * 0.2 },
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${iconColor} blur-md opacity-70`}
              />
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${iconColor} ${iconGlow} relative z-10 flex items-center justify-center`}
              >
                <IconComp
                  className={`w-7 h-7 ${
                    isFinalStep ? "text-[#0a1a2f]" : "text-[#0a1a2f]"
                  }`}
                />
              </div>
            </div>

            {/* نص الخطوة */}
            <div className="bg-[#10263f]/60 border border-cyan-400/20 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300 max-w-[80%]">
              <h3 className="text-cyan-400 font-bold mb-2">
                {lang === "ar" ? `الخطوة ${index + 1}` : `Step ${index + 1}`}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">{step}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
</section>







{/* Trust & Quality Section */}
<section className="relative py-20 px-6 text-center bg-gradient-to-b from-[#0c182f] to-[#0a1122] overflow-hidden">
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-4 drop-shadow-[0_0_20px_rgba(0,255,150,0.5)]"
    style={{ fontFamily: 'Cairo, sans-serif' }}
  >
    {t.trustSection.title}
    <span className="block text-base md:text-lg text-gray-400 mt-2">
      {t.trustSection.subtitle}
    </span>
  </motion.h2>

  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.8 }}
    className="text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
  >
    {t.trustSection.tagline}
  </motion.p>

  <div className="relative">
    {/* أزرار التنقل */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        className="bg-emerald-500/20 hover:bg-emerald-500/40 p-2 rounded-full text-emerald-300 transition-all duration-300 active:scale-90"
        onClick={() =>
          document
            .getElementById('trust-scroll')
            .scrollBy({ left: -300, behavior: 'smooth' })
        }
      >
        ‹
      </button>
      <button
        className="bg-emerald-500/20 hover:bg-emerald-500/40 p-2 rounded-full text-emerald-300 transition-all duration-300 active:scale-90"
        onClick={() =>
          document
            .getElementById('trust-scroll')
            .scrollBy({ left: 300, behavior: 'smooth' })
        }
      >
        ›
      </button>
    </div>

    {/* الكروت */}
    <div
      id="trust-scroll"
      className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8 scrollbar-hide scroll-smooth snap-x snap-mandatory max-w-6xl mx-auto"
    >
      {t.trustSection.items.map((item, i) => {
        const Icon = icons[item.icon];
        return (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="flex-shrink-0 w-72 sm:w-auto snap-center p-8 rounded-2xl bg-[#10263f]/60 backdrop-blur-md border border-emerald-400/20 shadow-lg hover:shadow-[0_0_25px_rgba(0,255,150,0.3)] transition-all"
          >
            <div className="flex justify-center mb-4">
              <Icon className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_15px_rgba(0,255,150,0.7)]" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-3">{item.title}</h3>
            <p className="text-gray-300 leading-relaxed">{item.desc}</p>
          </motion.div>
        );
      })}
    </div>
  </div>
</section>








{/* FAQ Section - Ultra Pro Interactive */}
<section className="py-20 px-6 max-w-4xl mx-auto relative z-10">
  <h2 className="text-3xl md:text-4xl font-extrabold text-cyan-400 mb-16 text-center drop-shadow-[0_0_30px_rgba(0,255,255,0.9)]">
    {lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
  </h2>

  <div className="space-y-6">
    {t.faq.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.2 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.3)] border border-white/10 cursor-pointer group"
        onClick={() => {
          const panel = document.getElementById(`faq-answer-${i}`);
          panel.classList.toggle("max-h-0");
          panel.classList.toggle("max-h-40");
        }}
      >
        <h3 className="text-lg md:text-xl font-bold text-white flex justify-between items-center">
          {item.question}
          <motion.span
            className="text-cyan-400 text-2xl md:text-3xl transition-transform duration-300"
            whileHover={{ rotate: 90, scale: 1.2, textShadow: "0 0 15px #00ffff" }}
          >
            +
          </motion.span>
        </h3>
        <p
          id={`faq-answer-${i}`}
          className="text-gray-300 mt-3 max-h-0 overflow-hidden transition-all duration-500 ease-in-out"
        >
          {item.answer}
        </p>
      </motion.div>
    ))}
  </div>
</section>




































{/* Ultra Pro Call To Action Section - Circular Design */}
<section className="relative z-10 flex flex-col items-center justify-center py-24 px-6 overflow-visible">
  {/* Circular Stars Background */}
  <div className="absolute inset-0 -z-10 flex items-center justify-center">
    {[...Array(30)].map((_, i) => {
      const angle = (360 / 30) * i;
      const radius = 200 + Math.random() * 100; // دائرة حول المركز
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return (
        <span
          key={i}
          className="absolute bg-white/50 rounded-full animate-pulse"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            transform: `translate(${x}px, ${y}px)`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      );
    })}
    <div className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-cyan-400/30 animate-spin-slow" />
  </div>

  {/* Circular Container */}
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1 }}
    className="relative flex flex-col items-center justify-center rounded-full bg-gradient-to-tr from-cyan-700 via-blue-900 to-purple-800 p-16 md:p-24 shadow-[0_0_80px_rgba(0,255,255,0.4)]"
  >
    {/* Title */}
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="text-4xl md:text-5xl font-extrabold text-cyan-300 drop-shadow-[0_0_25px_rgba(0,255,255,0.9)] mb-6 text-center animate-[pulse_2s_ease-in-out_infinite]"
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      {t.heroTitle} {/* يتغير حسب اللغة */}
    </motion.h2>

    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 1 }}
      className="text-gray-200 mb-10 text-lg md:text-xl text-center max-w-xl"
    >
      {t.heroSub} {/* يتغير حسب اللغة */}
    </motion.p>

    {/* WhatsApp Button - Circular & Pulsing */}
    <motion.a
      href="https://wa.me/201116565958"
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.15, textShadow: "0 0 15px #00ff77", boxShadow: "0 0 50px #00ff77" }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center justify-center gap-3 w-40 h-40 md:w-48 md:h-48 bg-green-500 text-white font-bold rounded-full text-2xl md:text-3xl shadow-[0_0_30px_rgba(0,255,0,0.7)] animate-pulse transition-all flex flex-col"
    >
      <FaWhatsapp className="text-4xl md:text-5xl" />
      {t.whatsapp} {/* يتغير حسب اللغة */}
    </motion.a>

    {/* Professional Icon Text */}
    <motion.p
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 1 }}
      className="mt-8 text-gray-400 flex items-center justify-center gap-2 text-lg md:text-xl text-center"
    >
      <FaTools className="text-cyan-400 animate-pulse text-3xl md:text-5xl" />
      {lang === "ar"
        ? "يمكننا مساعدتك في تركيب الكشافات، صيانتها، أو أي استفسار آخر بسرعة واحترافية."
        : "We can help you install, maintain, or consult about spotlights quickly and professionally."}
    </motion.p>
  </motion.div>
</section>








      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 border-t border-white/8 relative z-10">
        <div className="mb-4 flex justify-center gap-3 flex-wrap">
          <a className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 hover:animate-pulse transition" href="https://wa.me/201000000000" target="_blank" rel="noreferrer">
            <FaWhatsapp /> {t.whatsapp}
          </a>
          <a className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 hover:animate-pulse transition" href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook /> {t.facebook}
          </a>
        </div>
        <div className="text-sm">{t.footer}</div>
      </footer>
    </main>
  );
}

