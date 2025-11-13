"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish();
    }, 4000); // 4 ثواني قبل الانتقال للمتجر
    return () => clearTimeout(timer);
  }, [onFinish]);

  // إنشاء جزيئات صغيرة (Particles)
  const particles = Array.from({ length: 50 });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#041029] via-[#0c1a33] to-[#041029]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          {/* ✨ Particles */}
          {particles.map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-50 pointer-events-none"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{
                repeat: Infinity,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
              }}
            />
          ))}

        <motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
  transition={{ type: "tween", duration: 1.2 }}
  className="relative z-10 rounded-full overflow-hidden w-36 h-36 drop-shadow-[0_0_35px_cyan] flex items-center justify-center bg-gradient-to-br from-cyan-400/40 via-blue-400/30 to-cyan-300/20"
>
  <Image
    src="/logo.png"
    width={140}
    height={140}
    alt="Logo"
    className="rounded-full"
  />
</motion.div>

{/* اسم المتجر */}
<motion.h1
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.6, duration: 1 }}
  className="mt-4 text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 drop-shadow-[0_2px_25px_cyan]"
>
  Bright House
</motion.h1>

{/* جاري الدخول */}
<motion.h2
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.8, duration: 1 }}
  className="absolute bottom-20 text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200 drop-shadow-[0_2px_15px_cyan]"
>
  جاري الدخول إلى المتجر...
</motion.h2>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
