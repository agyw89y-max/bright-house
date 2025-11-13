"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Home,
  ShoppingCart,
  Phone,
  Mail,
  PhoneCall,
} from "lucide-react";
import { useEffect } from "react";

export default function Footer({ lang = "en" }) {
  const t = {
    en: {
      about: "Lighting the Future with Trust and Innovation 🌟",
      quick: "Quick Links",
      home: "Home",
      cart: "Cart",
      contactUs: "Contact Us",
      contact: "Contact",
      follow: "Follow Us",
      email: "support@brighthouse.com",
      phone: "+20 123 456 7890",
      rights: "All Rights Reserved 💡",
    },
    ar: {
      about: "مع برايت هاوس، كل ضوء يحكي قصة ثقة وجودة 🌟",
      quick: "روابط سريعة",
      home: "الرئيسية",
      cart: "عربة التسوق",
      contactUs: "اتصل بنا",
      contact: "تواصل معنا",
      follow: "تابعنا",
      email: "الدعم@brighthouse.com",
      phone: "+20 123 456 7890",
      rights: "جميع الحقوق محفوظة 💡",
    },
  }[lang];

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    footer.classList.add("opacity-0", "translate-y-10");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("transition-all", "duration-1000");
            footer.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(footer);
  }, []);

  return (
    <footer
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative mt-20 bg-[#050b18]/90 backdrop-blur-2xl text-gray-300 overflow-hidden border-t border-cyan-400/20 shadow-inner"
    >
      {/* إضاءة خلفية */}
      <motion.div
        className="absolute inset-0 opacity-40 blur-3xl"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(6,182,212,0.35), transparent 60%)",
            "radial-gradient(circle at 80% 70%, rgba(168,85,247,0.35), transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(14,165,233,0.3), transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* موجة ضوء */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "loop" }}
      />

      {/* المحتوى */}
      <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 z-10">
        {/* شعار */}
        <div>
          <motion.h2
            animate={{
              textShadow: ["0 0 10px #0ff", "0 0 20px #09f", "0 0 10px #0ff"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]"
          >
            Bright House
          </motion.h2>
          <p className="text-gray-400 leading-relaxed mt-2">{t.about}</p>
        </div>

        {/* روابط */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t.quick}</h3>
          <ul className="space-y-3 text-gray-300">
            {[
              { icon: <Home className="w-5 h-5 text-cyan-400" />, label: t.home },
              { icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />, label: t.cart },
              { icon: <Phone className="w-5 h-5 text-cyan-400" />, label: t.contactUs },
            ].map((item, i) => (
              <motion.li
                key={i}
                whileHover={{ scale: 1.05, x: lang === "ar" ? -5 : 5 }}
                className="flex items-center gap-2 hover:text-cyan-400 transition"
              >
                {item.icon} {item.label}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* تواصل */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t.contact}</h3>
          <div className="flex items-center gap-2 mb-2 text-gray-400 hover:text-cyan-400 transition">
            <Mail className="w-5 h-5 text-cyan-400" />
            {t.email}
          </div>
          <div className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition">
            <PhoneCall className="w-5 h-5 text-cyan-400" />
            {t.phone}
          </div>
        </div>

        {/* سوشيال ميديا */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t.follow}</h3>
          <div className="flex gap-4">
            {[
              { icon: <Facebook className="text-blue-500" />, link: "#" },
              { icon: <Instagram className="text-pink-500" />, link: "#" },
              { icon: <Twitter className="text-sky-400" />, link: "#" },
              { icon: <Youtube className="text-red-500" />, link: "#" },
            ].map((s, i) => (
              <motion.a
                key={i}
                href={s.link}
                whileHover={{ scale: 1.3, rotate: 8 }}
                className="group w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shadow-inner hover:bg-white/10 transition relative overflow-hidden"
              >
                {/* نبض */}
                <motion.div
                  className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* الحقوق */}
      <div className="relative border-t border-white/10 mt-10 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-cyan-400 font-semibold">Bright House</span> — {t.rights}
      </div>
    </footer>
  );
}
