"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.location.reload(); // ✅ تحديث عام
  };

  // 👇 أضف setLang هنا علشان تقدر تستخدمها في الصفحات
  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
