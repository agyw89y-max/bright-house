"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "../../firebase/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import toast, { Toaster } from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Navbar from "../../components/Navbar";


import Footer from "../../components/Footer";


export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
const [lang, setLang] = useState("ar");

useEffect(() => {
  const savedLang = localStorage.getItem("bh_lang") || "ar";
  setLang(savedLang);
}, []);


  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [cart, setCart] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);



// Navbar.js
const changeLang = (newLang) => {
  localStorage.setItem("bh_lang", newLang);
  setLang(newLang); // هذا يحتاج لتحديث state في parent
};

useEffect(() => {
  const handleStorageChange = () => {
    const savedLang = localStorage.getItem("bh_lang") || "ar";
    setLang(savedLang);
  }

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);



  const translations = {
  ar: {
    notFound: "المنتج غير موجود",
    loading: "جارٍ التحميل...",
    specsTitle: "المواصفات الفنية",
    reviews: "التقييمات",
    addReview: "أضف تقييم",
    cancel: "إلغاء",
       relatedProducts: "منتجات مشابهة",
    noRelated: "—",
       mayLike: "قد يعجبك أيضاً",

    addToCart: "أضف للعربة",
    buyNow: "اشتري الآن",
    share: "مشاركة",
 noReviews: "لا توجد تقييمات بعد",
       reviews: "التقييمات",
    fillNameText: "املأ الاسم والنص",
    reviewAdded: "تم إضافة تعليقك",
    yourName: "اسمك",
    writeReview: "اكتب تعليقك...",
    addReview: "أضف تقييم",
    cancel: "إلغاء",
  },
  en: {
    notFound: "Product not found",
    loading: "Loading...",
    specsTitle: "Technical Specifications",
    reviews: "Reviews",
    addReview: "Add Review",
    cancel: "Cancel",
        relatedProducts: "Related Products",
    noRelated: "—",

        mayLike: "You may also like",

    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    share: "Share",

    reviews: "Reviews",
    fillNameText: "Fill name and text",
    reviewAdded: "Your review was added",
    yourName: "Your Name",
    writeReview: "Write your review...",
    addReview: "Add Review",
    cancel: "Cancel",
 noReviews: "No reviews yet",
  },
};

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem("bh_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snapshot = await get(ref(db, `products`));
        if (snapshot.exists()) {
          const prodsArr = Object.values(snapshot.val());
          const found = prodsArr.find((p) => p.id === id);
          if (found) {
            // Normalize images
            if (!found.images || !Array.isArray(found.images)) {
              found.images = found.image ? [found.image] : [];
            } else if (found.image && !found.images.includes(found.image)) {
              found.images = [found.image, ...found.images];
            }
            setProduct(found);

            // Related products
            setRelated(prodsArr.filter((p) => p.id !== id).slice(0, 8));
          } else setProduct(null);
        }
      } catch (err) {
        console.error("Firebase error:", err);
        toast.error("حدث خطأ أثناء تحميل البيانات");
      }
    };
    fetchProduct();
  }, [id]);

  // Load reviews
  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${id}`);
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, [id]);

  const addToCartLocal = (p) => {
    const exists = cart.find((c) => c.id === p.id);
    const updated = exists
      ? cart.map((c) =>
          c.id === p.id ? { ...c, qty: Math.min((c.qty || 1) + 1, p.stock || 99) } : c
        )
      : [...cart, { ...p, qty: 1 }];
    setCart(updated);
    localStorage.setItem("bh_cart", JSON.stringify(updated));
    toast.success("أضيف إلى العربة");
  };

  const buyNow = (p) => {
    addToCartLocal(p);
    router.push("/cart");
  };

  if (!mounted || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="animate-pulse text-gray-500">
          {product === null ? "المنتج غير موجود" : "جارٍ التحميل..."}
        </div>
      </div>
    );
  }

const specs = product.specs?.[lang] || {}; // بدل .ar استخدم [lang]
const images = product.images.map((img) => ({ src: img, description: product.name?.[lang] }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#03061a] via-[#041029] to-[#061025] text-white pb-28 relative overflow-hidden">
      <Toaster />
     {/* Navbar */}
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")} logo="/logo.png" />

      {/* خلفية نجمية ديناميكية */}
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, 3, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: Math.random() * 3 + 2 }}
          />
        ))}
      </motion.div>

      {/* القسم الرئيسي */}
      <section className="max-w-7xl mx-auto px-4 mt-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: صورة + Lightbox */}
<div className="space-y-4">
  {/* الصورة الكبيرة مع Glow ديناميكي */}
  <motion.div
    className="relative cursor-zoom-in group"
    whileHover={{ scale: 1.03 }}
    onClick={() => { setLightboxIndex(0); setOpen(true); }}
  >
    {/* Glow متحرك */}
    <motion.div
      className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 blur-2xl animate-pulse transition-all duration-500"
      animate={{
        opacity: lightboxIndex === 0 ? [0.4, 0.7, 0.4] : 0,
        rotate: [0, 5, 0],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
    <motion.img
      src={product.images[0]}
      alt={product.name?.ar}
      className="relative rounded-3xl w-full h-auto shadow-2xl ring-2 transition-transform duration-500"
      style={{ ringColor: lightboxIndex === 0 ? "#06b6d4" : "rgba(0,0,0,0.2)" }}
      whileHover={{ scale: 1.05 }}
    />
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
<span className="text-blue-300 text-lg font-semibold">
  {lang === "ar" ? "اضغط للتكبير 🔍" : "Click to enlarge 🔍"}
</span>

    </div>
  </motion.div>

  {/* Swiper carousel المصغر أسفل الصورة */}
<Swiper
  modules={[Navigation, Autoplay]}
  slidesPerView={3}
  spaceBetween={8}
  navigation
  autoplay={{ delay: 2500, disableOnInteraction: false }}
  breakpoints={{
    640: { slidesPerView: 3 },
    768: { slidesPerView: 4 },
    1024: { slidesPerView: 5 },
  }}
  className="py-2"
>
  {product.images.map((img, idx) => (
    <SwiperSlide key={idx}>
      <motion.div
        className="relative rounded-xl overflow-hidden"
        animate={{
          scale: lightboxIndex === idx ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Glow خلف الصورة */}
        <motion.div
          className="absolute inset-0 rounded-xl blur-xl"
          animate={{
            opacity: lightboxIndex === idx ? 0.6 : 0,
            background: lightboxIndex === idx
              ? "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)"
              : "transparent",
          }}
          transition={{
            duration: 0.8,
            repeat: lightboxIndex === idx ? Infinity : 0,
            repeatType: "mirror",
          }}
        />

        <motion.img
          src={img}
          alt={`${product.name?.ar} ${idx + 1}`}
          className="w-full h-20 object-cover cursor-pointer border-2 border-transparent relative z-10 rounded-xl"
          whileHover={{
            scale: 1.08,
            borderColor: "#06b6d4",
            boxShadow: "0 0 15px rgba(6,182,212,0.6)",
          }}
          onClick={() => { setLightboxIndex(idx); setOpen(true); }}
        />
      </motion.div>
    </SwiperSlide>
  ))}
</Swiper>


  {/* Lightbox */}
  <Lightbox
    open={open}
    close={() => setOpen(false)}
    slides={images}
    index={lightboxIndex}
    plugins={[Zoom, Thumbnails, Captions]}
    animation={{ fade: 300, swipe: 300 }}
    carousel={{ finite: false, preload: 2 }}
    zoom={{ maxZoomPixelRatio: 3 }}
    captions={{ showToggle: true, descriptionTextAlign: "center" }}
    styles={{ container: { backgroundColor: "rgba(0,0,0,0.9)" } }}
  />
</div>

        {/* Right: معلومات */}
        <div className="flex flex-col gap-4">
         <h1 className="text-3xl md:text-4xl font-extrabold">
  {product.name?.[lang] || product.name?.ar}
</h1>
<p className="text-gray-400">
  {product.shortDescription?.[lang] || product.description?.[lang] || product.shortDescription?.ar || product.description?.ar}
</p>

          <div className="flex items-center gap-4 mt-2">
            <div className="text-3xl font-bold text-cyan-400">EGP {product.price}</div>
            {product.oldPrice && <div className="text-gray-400 line-through">EGP {product.oldPrice}</div>}
            <div className="text-yellow-400 ml-auto">{product.rating ? `${product.rating}★` : "4★"}</div>
          </div>


















<motion.button
  whileTap={{ scale: 0.93 }}
  whileHover={{ scale: 1.05 }}
  onClick={() => {
    const url = window.location.href;
    const shareText = `${product.name?.ar} - ${product.shortDescription?.ar || product.description?.ar}`;
    const shareOptions = [
      { name: "WhatsApp", url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}` },
      { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}` },
    ];

    if (navigator.share) {
      navigator.share({ title: product.name?.ar, text: shareText, url }).catch(() => {
        toast.error("لم يتمكن المتصفح من المشاركة 😢");
      });
    } else {
      // نسخ الرابط مع دعم كل المتصفحات
      try {
        navigator.clipboard.writeText(url);
        toast.success("تم نسخ رابط المنتج للمشاركة! 🌟");
      } catch {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        toast.success("تم نسخ الرابط بنجاح! 🌟");
      }
    }

    // فتح النوافذ
    shareOptions.forEach(opt => window.open(opt.url, "_blank", "width=600,height=400"));
  }}
  className="ml-auto relative flex items-center gap-3 px-6 py-3 rounded-full 
             bg-gradient-to-r from-purple-600/80 to-pink-500/80 
             backdrop-blur-md border border-white/10
             shadow-lg text-white font-semibold overflow-hidden
             transition-all duration-500 group"
>
  {/* أيقونات الشبكات الاجتماعية - أنيميشن خرافي */}
  <div className="flex gap-2">
    {/* WhatsApp */}
    <motion.div
      whileHover={{ y: -4, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500/80 shadow-md animate-pulse"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-4 h-4">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.09 1.51 5.84L0 24l6.33-1.66C8.05 23.42 10 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0zM18.47 17.41c-.25.7-1.45 1.36-1.98 1.44-.53.08-1.18.12-2.17-.38-1.76-.79-2.89-2.66-3.02-2.86-.13-.2-1.04-1.47-1.04-2.81s.95-1.62 1.28-1.85c.34-.23.73-.25 1.01-.25.28 0 .5 0 .72.01.23 0 .55-.09.86.65.31.74 1.06 2.58 1.16 2.78.09.2.15.43.03.69-.12.26-.22.42-.46.66-.23.24-.49.52-.7.7-.2.17-.43.31-.21.62.22.3 1.01 1.67 2.17 2.7 1.5 1.38 2.29 1.56 2.63 1.74.34.18.54.15.73-.09.2-.24.85-.91.96-1.23.12-.32.12-.59.08-.64-.03-.05-.13-.09-.26-.15z"/>
      </svg>
    </motion.div>

    {/* Facebook */}
    <motion.div
      whileHover={{ y: -4, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600/80 shadow-md animate-pulse"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-4 h-4">
        <path d="M22.676 0H1.324C.594 0 0 .593 0 1.324v21.352C0 23.406.594 24 1.324 24h11.495v-9.294H9.692v-3.622h3.127V8.414c0-3.1 1.892-4.788 4.655-4.788 1.324 0 2.462.099 2.793.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.311h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.324V1.324C24 .593 23.406 0 22.676 0z"/>
      </svg>
    </motion.div>

    {/* Twitter */}
    <motion.div
      whileHover={{ y: -4, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-400/80 shadow-md animate-pulse"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-4 h-4">
        <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775A4.932 4.932 0 0 0 23.337 2a9.865 9.865 0 0 1-3.127 1.195A4.918 4.918 0 0 0 8.826 7.676 13.94 13.94 0 0 1 1.671 3.149a4.918 4.918 0 0 0 1.523 6.574 4.903 4.903 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.924 4.924 0 0 0 4.6 3.417A9.87 9.87 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.06 0 14.01-7.513 14.01-14.01 0-.213 0-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/>
      </svg>
    </motion.div>
  </div>
<span className="font-bold tracking-wide text-lg">
  {lang === "ar" ? "مشاركة" : "Share"}
</span>

  {/* توهج خلفي خفيف */}
  <div className="absolute inset-0 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"></div>
</motion.button>


<div className="flex gap-3 mt-4 items-center">
<div className="flex gap-3 mt-4 items-center">
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      addToCartLocal(product);
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {lang === "ar" ? "تم إضافة المنتج بنجاح إلى العربة! 🌟" : "Product added to cart! 🌟"}
          </div>
        ),
        { duration: 3000 }
      );
    }}
    className="px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg text-white font-semibold relative overflow-hidden"
  >
    {lang === "ar" ? "أضف للعربة" : "Add to Cart"}
  </motion.button>

  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      buyNow(product);
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg text-black font-bold flex items-center gap-2 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {lang === "ar" ? "جاري تحويلك لعربة التسوق... 🚀" : "Redirecting to cart... 🚀"}
          </div>
        ),
        { duration: 3000 }
      );
    }}
    className="px-5 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg text-black font-semibold relative overflow-hidden"
  >
    {lang === "ar" ? "اشتري الآن" : "Buy Now"}
  </motion.button>
</div>


</div>

          {/* مواصفات مع تأثير hover */}
          {product.specs && (
            <div className="mt-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-3">{translations[lang].specsTitle}</h3>

              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto text-left">
                  <tbody>
                    {Object.entries(specs).map(([k, v]) => (
                      <motion.tr
                        key={k}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-white/10"
                      >
                        <th className="px-4 py-3 text-cyan-300 font-medium w-1/3">{k}</th>
                        <td className="px-4 py-3 text-gray-200">{v}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews & Related */}
      <section className="max-w-7xl mx-auto px-4 mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews */}
          <div className="lg:col-span-2">
           <h2 className="text-2xl font-bold mb-4">{translations[lang].reviews}</h2>

          
          
          
          
          
          
          
          
          
           <form
  onSubmit={(e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      toast.error(translations[lang].fillNameText); // جديد
      return;
    }
    const newReview = {
      id: `r_${Date.now()}`,
      name: reviewName.trim(),
      text: reviewText.trim(),
      rating: Number(reviewRating),
      createdAt: new Date().toISOString(),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setReviewName("");
    setReviewText("");
    setReviewRating(5);
    toast.success(translations[lang].reviewAdded); // جديد
  }}
  className="bg-white/5 p-4 rounded-2xl mb-6"
>
  <div className="flex gap-2 mb-2">
    <input
      value={reviewName}
      onChange={(e) => setReviewName(e.target.value)}
      placeholder={translations[lang].yourName} // جديد
      className="flex-1 px-3 py-2 rounded bg-transparent border border-white/10"
    />
    <select
      value={reviewRating}
      onChange={(e) => setReviewRating(e.target.value)}
      className="px-3 py-2 rounded bg-transparent border border-white/10"
    >
      {[5, 4, 3, 2, 1].map((r) => (
        <option key={r} value={r}>{r}★</option>
      ))}
    </select>
  </div>
  <textarea
    value={reviewText}
    onChange={(e) => setReviewText(e.target.value)}
    placeholder={translations[lang].writeReview} // جديد
    className="w-full px-3 py-2 rounded bg-transparent border border-white/10 mb-3"
    rows={3}
  />
  <div className="flex gap-2">
    <button type="submit" className="px-4 py-2 rounded bg-cyan-500 text-white font-semibold">
      {translations[lang].addReview} 
    </button>
    <button
      type="button"
      onClick={() => {
        setReviewName("");
        setReviewText("");
        setReviewRating(5);
      }}
      className="px-4 py-2 rounded border border-white/10"
    >
      {translations[lang].cancel} 
    </button>
  </div>
</form>




<div className="space-y-4">
  {reviews.length === 0 ? (
    <div className="text-gray-400">{translations[lang].noReviews}</div>
  ) : (
    reviews.map((r) => (
      <motion.div key={r.id} className="bg-white/5 p-4 rounded-2xl" whileHover={{ scale: 1.01 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{r.name}</div>
            <div className="text-sm text-gray-300">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-yellow-400">{`${r.rating}★`}</div>
        </div>
        <p className="mt-2 text-gray-200">{r.text}</p>
      </motion.div>
    ))
  )}
</div>
</div>





          {/* Related products carousel */}
          <aside className="bg-white/5 p-4 rounded-2xl">
        
            <h3 className="text-lg font-semibold mb-3">{translations[lang].relatedProducts}</h3>
{related.length === 0 ? (
  <div className="text-gray-400">{translations[lang].noRelated}</div>
) : (
  <Swiper
    modules={[Autoplay, Navigation]}
    slidesPerView={1}
    spaceBetween={12}
    autoplay={{ delay: 2500, disableOnInteraction: false }}
    navigation
    loop
    className="py-2"
  >
    {related.map((p, idx) => (


<SwiperSlide key={p.id}>
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl shadow-2xl relative overflow-hidden cursor-pointer"
    onClick={() => {
      setLightboxIndex(0);
      router.push(`/product/${p.id}`);
    }}
  >
    {/* Glow ديناميكي */}
    <motion.div
      className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 blur-2xl opacity-40"
      animate={{ rotate: [0, 5, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
    />

    {/* الصورة */}
    <div className="relative w-full aspect-square md:aspect-[16/9] rounded-2xl overflow-hidden">
<Image
  src={p?.images?.[0] || "/placeholder.png"}
  alt={(p?.name?.[lang] || p?.name?.ar || "Product Image").toString()}
  fill
  className="object-contain transition-transform duration-500 hover:scale-105"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
/>


    </div>

    {/* الاسم والسعر */}
    <div className="mt-3 p-2">
      <div className="font-bold text-white line-clamp-2">{p.name?.[lang] || p.name}</div>
      <div className="text-cyan-400 font-extrabold mt-1">EGP {p.price}</div>
    </div>
  </motion.div>
</SwiperSlide>


    ))}
  </Swiper>
)}

          </aside>
        </div>
      </section>


      {/* You may like carousel */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12 relative z-10">
<h3 className="text-2xl font-extrabold mb-4">قد يعجبك أيضاً</h3>

          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={2}
            spaceBetween={18}
            loop
            autoplay={{ delay: 2200, disableOnInteraction: false }}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="py-4"
          >
            {related.map((p) => (
             
             
  <SwiperSlide key={"big-" + p.id}>
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl shadow-2xl relative overflow-hidden cursor-pointer"
    onClick={() => router.push(`/product/${p.id}`)}
  >
    {/* Glow ديناميكي */}
    <motion.div
      className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 blur-2xl opacity-40"
      animate={{ rotate: [0, 5, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
    />
    
    {/* الصورة */}
    <div className="relative w-full aspect-square md:aspect-[16/9] rounded-2xl overflow-hidden">
<Image
  src={p?.images?.[0] || "/placeholder.png"}
  alt={(p?.name?.[lang] || p?.name?.ar || "Product Image").toString()}
  fill
  className="object-contain transition-transform duration-500 hover:scale-105"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
/>

    </div>

    {/* Overlay نصوص */}
    <div className="mt-3 p-2">
      <div className="font-bold text-white line-clamp-2">{p.name?.[lang] || p.name}</div>
      <div className="text-cyan-400 font-extrabold mt-1">EGP {p.price}</div>
    </div>

 
  </motion.div>
</SwiperSlide>





            ))}
          </Swiper>
        </section>
      )}








  <Footer lang={lang} /> {/* ✅ هنا مكانه الصحيح */}

    </main>
  );
}




    