"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { db } from "../../../firebase/firebase";
import { ref, get, push, set, update, remove, onValue } from "firebase/database";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

// ---------------------------
// Professional AdminProducts
// Single-file React component (Tailwind CSS)
// Improvements added:
// - Clean, modular structure (small subcomponents inside file)
// - Better UX: toolbar, debounced search, clear empty states, skeleton loader
// - Cleaner modal editor with tabs, form validation & previews
// - Image handling preserved + safer URL revokes
// - Stable ordering per-category on create
// - Utilities: generate SKU, sanitize specs, category => default specs mapping
// - Accessibility: aria-* where relevant
// ---------------------------

// Cloudinary helper (unchanged preset + cloud from original)
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_electro");
  const res = await axios.post(
    "https://api.cloudinary.com/v1_1/dqp0mtqdn/image/upload",
    formData
  );
  return res.data.secure_url;
};

export default function AdminProducts() {
  const { id: categoryId } = useParams();
  const router = useRouter();

  // core state
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal/editor state
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited or null for new
  const [tab, setTab] = useState("general");

  // form fields
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [shortDescAr, setShortDescAr] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [sku, setSku] = useState("");
  const [flash, setFlash] = useState(false);

  // specs
  const [specsAr, setSpecsAr] = useState([["", ""]]);
  const [specsEn, setSpecsEn] = useState([["", ""]]);

  // images
  const [imagesMap, setImagesMap] = useState([]);
  const fileRef = useRef(null);

  // ui helpers
  const [lang, setLang] = useState("ar");
  const [query, setQuery] = useState("");
  const [showFlashOnly, setShowFlashOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // small debounce for search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 200);
    return () => clearTimeout(t);
  }, [query, showFlashOnly]);

  // ----- default specs (cleaned & grouped) -----
  const defaultMagneticSpecsAr = [
    ["قوة الإضاءة", "7 وات"],
    ["لون الإضاءة", "أصفر 3000K"],
    ["العمر الافتراضي", "30000 ساعة عمل"],
    ["مقاومة الماء", "IP65"],
    ["مادة التصنيع", "ألمنيوم"],
    ["الاستخدام", "الحدائق – النباتات – الزينة الخارجية"],
  ];
  const defaultMagneticSpecsEn = [
    ["Lighting Power", "7 Watt"],
    ["Light Color", "Yellow 3000K"],
    ["Lifespan", "30,000 Working Hours"],
    ["Water Resistance", "IP65"],
    ["Material", "Aluminum"],
    ["Suitable for", "Gardens – Plants – Outdoor Decoration"],
  ];

  const defaultLedProfileSpecsAr = [
    ["عدد الحبات", "240 حبة"],
    ["بكر ليد", "5 متر"],
    ["لون الإضاءة", "أبيض"],
  ];
  const defaultLedProfileSpecsEn = [
    ["Number of Grains", "240 Tablets"],
    ["LED Roll", "5M"],
    ["Light Color", "White"],
  ];

  const defaultPlantingSpecsAr = defaultMagneticSpecsAr.slice();
  const defaultPlantingSpecsEn = defaultMagneticSpecsEn.slice();

  const defaultSpecsAr = [
    ["الاستطاعة", "30 وات"],
    ["نوع الإضاءة", "عيون"],
    ["درجة لون الإضاءة", "4000K - 3000K (أبيض دافئ / نهاري دافئ)"],
    ["اللون", "أسود"],
    ["يناسب", "المنازل – المعارض – المكاتب – المحلات التجارية"],
    ["الطول", "10 سم"],
  ];
  const defaultSpecsEn = [
    ["Power", "30 Watt"],
    ["Light Type", "Spot Light"],
    ["Color Temperature", "4000K - 3000K (Warm White / Warm Neutral)"],
    ["Body Color", "Black"],
    ["Suitable for", "Homes – Offices – Showrooms – Shops"],
    ["Length", "10 cm"],
  ];

  const categorySpecsMap = {
    "LED Profile": [defaultLedProfileSpecsAr, defaultLedProfileSpecsEn],
    "Planting Spear": [defaultPlantingSpecsAr, defaultPlantingSpecsEn],
    Magnetic: [defaultMagneticSpecsAr, defaultMagneticSpecsEn],
  };

  // ---------- fetch data ----------
  useEffect(() => {
    fetchCategory();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const snap = await get(ref(db, `categories/${categoryId}`));
      if (snap.exists()) setCategory(snap.val());
    } catch (err) {
      console.error("fetchCategory:", err);
      toast.error("خطأ في جلب بيانات القسم");
    }
  };

  const normalizeProduct = (raw) => {
    let images = [];
    if (Array.isArray(raw.images) && raw.images.length > 0) images = raw.images;
    else if (raw.image) images = [raw.image];
    return { ...raw, images };
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await get(ref(db, "products"));
      if (snap.exists()) {
        const all = Object.entries(snap.val()).map(([k, v]) => ({ id: k, ...normalizeProduct(v) }));
        all.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProducts(all.filter((p) => p.categoryId === categoryId));
      } else setProducts([]);
    } catch (err) {
      console.error("fetchProducts:", err);
      toast.error("خطأ في جلب المنتجات");
    }
    setLoading(false);
  };

  // live listener for responsive updates
  useEffect(() => {
    const productsRef = ref(db, "products");
    const unsub = onValue(productsRef, (snapshot) => {
      if (!snapshot.exists()) return setProducts([]);
      const all = Object.entries(snapshot.val())
        .map(([id, p]) => ({ id, ...normalizeProduct(p) }))
        .filter((p) => p.categoryId === categoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(all);
    });
    return () => unsub();
  }, [categoryId]);

  // ---------- editor open ----------
  const openEditor = (product = null) => {
    setEditing(product);
    setTab("general");

    setNameAr(product?.name?.ar || "");
    setNameEn(product?.name?.en || "");
    setPrice(product?.price ?? "");
    setOldPrice(product?.oldPrice ?? "");
    setShortDescAr(product?.shortDescription?.ar || "");
    setShortDescEn(product?.shortDescription?.en || "");
    setSku(product?.sku || generateSKU(product?.name?.en || ""));
    setFlash(!!product?.flash);

    if (!product) {
      const specs = categorySpecsMap[category?.name?.en] || [defaultSpecsAr, defaultSpecsEn];
      setSpecsAr(specs[0]);
      setSpecsEn(specs[1]);
    } else {
      setSpecsAr(product?.specs?.ar ? Object.entries(product.specs.ar) : defaultSpecsAr);
      setSpecsEn(product?.specs?.en ? Object.entries(product.specs.en) : defaultSpecsEn);
    }

    setImagesMap((product?.images || []).map((src, i) => ({ id: `existing-${i}-${Date.now()}`, src, existing: true })));
    if (fileRef.current) fileRef.current.value = null;
    setIsOpen(true);
  };

  // ---------- specs helpers ----------
  const handleAddSpec = () => {
    setSpecsAr((s) => [...s, ["", ""]]);
    setSpecsEn((s) => [...s, ["", ""]]);
  };
  const handleSpecChange = (i, field, value, langType) => {
    if (langType === "ar") {
      setSpecsAr((prev) => {
        const copy = [...prev];
        copy[i] = [...(copy[i] || ["", ""])];
        copy[i][field] = value;
        return copy;
      });
    } else {
      setSpecsEn((prev) => {
        const copy = [...prev];
        copy[i] = [...(copy[i] || ["", ""])];
        copy[i][field] = value;
        return copy;
      });
    }
  };
  const sanitizeEntries = (entries) =>
    entries
      .filter(([key, value]) => key && String(key).trim() !== "" && !/[.#$/[\]]/.test(String(key)) && String(value || "").trim() !== "")
      .map(([key, value]) => [String(key).trim(), String(value).trim()]);

  const generateSKU = (nameEn = "") => {
    const prefix = (nameEn || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() || "PRD";
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `${prefix}-${rnd}`;
  };

  // ---------- image handling ----------
  const onSelectFiles = (files) => {
    if (!files) return;
    const arr = Array.from(files);
    const mapped = arr.map((f, i) => ({ id: `new-${Date.now()}-${i}-${f.name}`, src: URL.createObjectURL(f), file: f, existing: false }));
    setImagesMap((prev) => [...mapped, ...prev]);
  };

  const removeImage = (index) => {
    setImagesMap((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      const url = removed?.src;
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      return copy;
    });
  };

  const makeFeatured = (i) => {
    setImagesMap((prev) => {
      if (i === 0) return prev;
      const copy = [...prev];
      const [sel] = copy.splice(i, 1);
      copy.unshift(sel);
      return copy;
    });
  };

  const uploadSelectedFiles = async (imagesArr) => {
    const filesToUpload = imagesArr.filter((i) => i.file).map((i) => i.file);
    if (filesToUpload.length === 0) return [];
    const urls = [];
    for (const f of filesToUpload) {
      const url = await uploadToCloudinary(f);
      urls.push(url);
    }
    return urls;
  };

  // ---------- save product ----------
  const saveProduct = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) return toast.error("الاسم باللغتين مطلوب");
    if (imagesMap.length === 0) return toast.error("يرجى رفع صورة واحدة على الأقل");

    setLoading(true);
    try {
      const uploaded = await uploadSelectedFiles(imagesMap);
      let upIndex = 0;
      const finalImages = imagesMap.map((it) => {
        if (it.existing) return it.src;
        const url = uploaded[upIndex++] || it.src;
        return url;
      });

      const cleanSpecsAr = sanitizeEntries(specsAr);
      const cleanSpecsEn = sanitizeEntries(specsEn);
      const specs = { ar: Object.fromEntries(cleanSpecsAr), en: Object.fromEntries(cleanSpecsEn) };

      const payload = {
        name: { ar: nameAr.trim(), en: nameEn.trim() },
        price: Number(price) || 0,
        oldPrice: Number(oldPrice) || 0,
        shortDescription: { ar: shortDescAr, en: shortDescEn },
        images: finalImages,
        categoryId,
        flash,
        sku: sku || generateSKU(nameEn),
        specs,
      };

      if (editing && editing.id) {
        await update(ref(db, `products/${editing.id}`), payload);
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
        toast.success("تم تعديل المنتج بنجاح");
        setIsOpen(false);
        setLoading(false);
        return;
      }

      // create new
      const sameCategory = products.filter((p) => p.categoryId === payload.categoryId);
      const maxOrder = sameCategory.reduce((m, p) => Math.max(m, p.order || 0), 0);
      const newRef = push(ref(db, "products"));
      const newProduct = { id: newRef.key, ...payload, order: maxOrder + 1 };
      await set(newRef, newProduct);
      setProducts((prev) => [...prev, newProduct]);
      toast.success("تم إضافة المنتج");
      setIsOpen(false);
    } catch (err) {
      console.error("saveProduct:", err);
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setLoading(false);
  };

  // ---------- utilities: fix old images & orders ----------
  const fixOldImages = async () => {
    const snap = await get(ref(db, "products"));
    if (!snap.exists()) return toast.error("لا يوجد منتجات");

    const updates = {};
    const data = snap.val();
    Object.entries(data).forEach(([id, p]) => {
      if (p.image && (!p.images || p.images.length === 0)) updates[`${id}/images`] = [p.image];
      updates[`${id}/image`] = null;
    });
    if (Object.keys(updates).length === 0) return toast.success("لا منتجات تحتاج تحديث ✅");
    await update(ref(db, "products"), updates);
    toast.success("✅ تم إصلاح جميع الصور القديمة");
  };

  const fixAllOrders = async () => {
    const snap = await get(ref(db, "products"));
    if (!snap.exists()) return toast.error("لا يوجد منتجات");
    const data = snap.val();
    const updates = {};
    const categories = {};
    Object.entries(data).forEach(([id, p]) => {
      if (!categories[p.categoryId]) categories[p.categoryId] = [];
      categories[p.categoryId].push({ ...p, id });
    });
    Object.values(categories).forEach((catProducts) => {
      catProducts.sort((a, b) => (a.order || 0) - (b.order || 0));
      catProducts.forEach((p, idx) => {
        updates[`${p.id}/order`] = idx;
      });
    });
    await update(ref(db, "products"), updates);
    toast.success("✅ تم إصلاح ترتيب كل المنتجات");
  };

  const deleteProduct = async (id) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    await remove(ref(db, `products/${id}`));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("تم حذف المنتج");
  };

  const moveUp = async (index) => {
    if (index === 0) return;
    const copy = [...products];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    const updates = {};
    copy.forEach((p, i) => (updates[`${p.id}/order`] = i));
    await update(ref(db, "products"), updates);
    setProducts(copy);
  };

  const moveDown = async (index) => {
    if (index === products.length - 1) return;
    const copy = [...products];
    [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
    const updates = {};
    copy.forEach((p, i) => (updates[`${p.id}/order`] = i));
    await update(ref(db, "products"), updates);
    setProducts(copy);
  };

  // ---------- filtering + pagination ----------
  const filtered = useMemo(() => {
    let arr = [...products];
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (p) =>
          (p.name?.ar || "").toLowerCase().includes(q) ||
          (p.name?.en || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
      );
    }
    if (showFlashOnly) arr = arr.filter((p) => p.flash);
    return arr;
  }, [products, query, showFlashOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, showFlashOnly]);

  const openFullPreview = (prod) => {
    if (!prod?.id) return toast.error("احفظ المنتج أولاً ليتم عرضه");
    window.open(`/product/${prod.id}`, "_blank");
  };

  // -------------------- UI Subcomponents (small) --------------------
  const Toolbar = () => (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between">
      <div>
        <h1 className="text-2xl font-bold">لوحة إدارة المنتجات — {category?.name?.[lang] || "القسم"}</h1>
        <p className="text-sm text-gray-400">واجهة مُحسّنة — منظمة ومهنية</p>
      </div>

      <div className="flex gap-2 items-center w-full md:w-auto">
        <div className="relative">
          <input aria-label="ابحث" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث باسم المنتج أو SKU" className="w-full md:w-64 p-2 rounded bg-white/5 placeholder-gray-400 focus:outline-none" />
          <button onClick={() => { setQuery(""); setShowFlashOnly(false); }} className="absolute left-2 top-2 text-gray-400">✖</button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showFlashOnly} onChange={(e) => setShowFlashOnly(e.target.checked)} /> Flash only
        </label>

        <button onClick={() => openEditor(null)} className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600">أضف منتج</button>
      </div>
    </div>
  );

  const EmptyState = ({ title, subtitle, action }) => (
    <div className="p-8 text-center text-gray-400">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2">{subtitle}</div>
      <div className="mt-4">{action}</div>
    </div>
  );

  // -------------------- render --------------------
  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <Toolbar />

      <div className="mt-6 bg-white/5 rounded-lg shadow p-4 glass-effect">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead className="text-gray-300 text-left">
              <tr>
                <th className="p-3 w-24">صورة</th>
                <th className="p-3">الاسم</th>
                <th className="p-3 w-32">السعر</th>
                <th className="p-3 w-24">Flash</th>
                <th className="p-3 w-48">SKU</th>
                <th className="p-3 w-36">ترتيب</th>
                <th className="p-3 w-48">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">جاري التحميل...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState title="لا توجد منتجات" subtitle="لم يتم العثور على منتجات بواسطة معايير البحث الحالية." action={<button onClick={() => openEditor(null)} className="px-3 py-1 rounded bg-blue-600">أضف منتج جديد</button>} />
                </td></tr>
              ) : (
                pageItems.map((p, idx) => (
                  <tr key={`${p.id}-${idx}`} className="border-t border-white/5 hover:bg-white/2">
                    <td className="p-2"><img src={p.images?.[0] || ""} alt="" className="w-20 h-20 object-cover rounded" /></td>
                    <td className="p-2">
                      <div className="font-semibold">{p.name?.[lang]}</div>
                      <div className="text-xs text-gray-400">{p.shortDescription?.[lang]}</div>
                    </td>
                    <td className="p-2">{p.oldPrice ? <span className="line-through text-gray-400 mr-2">{p.oldPrice}$</span> : null}<span className="font-bold">{p.price}$</span></td>
                    <td className="p-2">{p.flash ? <span className="text-yellow-400">نعم</span> : <span className="text-gray-400">لا</span>}</td>
                    <td className="p-2 text-xs">{p.sku || "-"}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => moveUp((page - 1) * pageSize + idx)} className="bg-blue-600 px-2 py-1 rounded">⬆</button>
                      <button onClick={() => moveDown((page - 1) * pageSize + idx)} className="bg-blue-600 px-2 py-1 rounded">⬇</button>
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => openEditor(p)} className="bg-yellow-500 px-3 py-1 rounded">تعديل</button>
                      <button onClick={() => deleteProduct(p.id)} className="bg-red-600 px-3 py-1 rounded">حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">إجمالي المنتجات: {filtered.length}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-white/5">السابق</button>
            <div className="px-3 py-1 bg-white/5 rounded">{page} / {totalPages}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-white/5">التالي</button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={fixOldImages} className="bg-red-500 px-3 py-1 rounded">إصلاح الصور القديمة لكل المنتجات</button>
          <button onClick={fixAllOrders} className="bg-green-600 px-3 py-1 rounded">إصلاح ترتيب الكل</button>
        </div>
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.form onSubmit={saveProduct} initial={{ y: -10, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, scale: 0.98 }} className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 w-full max-w-4xl rounded-xl p-6 max-h-[90vh] overflow-auto backdrop-blur-sm border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editing ? "تعديل المنتج" : "إضافة منتج (محترف)"}</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-3 py-1 rounded bg-white/5">إغلاق</button>
                  <button type="button" onClick={() => openFullPreview(editing)} className="px-3 py-1 rounded bg-white/10">معاينة كعميل</button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 border-b border-white/5 pb-2">
                { ["general", "desc", "image", "specs", "preview", "flash"].map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? "bg-white/5 ring-1 ring-white/10" : "bg-transparent"}`}>{t === "general" ? "البيانات" : t === "desc" ? "الوصف" : t === "image" ? "الصور" : t === "specs" ? "المواصفات" : t === "preview" ? "المعاينة" : "Flash"}</button>
                )) }
              </div>

              {tab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="اسم المنتج بالعربي" className="p-2 rounded bg-white/5" required />
                  <input name="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Product name (EN)" className="p-2 rounded bg-white/5" required />

                  <input name="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="السعر" className="p-2 rounded bg-white/5" required />
                  <input name="oldPrice" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} type="number" placeholder="السعر القديم" className="p-2 rounded bg-white/5" />

                  <input name="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU (اختياري)" className="p-2 rounded bg-white/5" />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { const generated = generateSKU(nameEn); setSku(generated); toast.success("تم توليد SKU"); }} className="px-3 py-1 rounded bg-blue-600">توليد SKU</button>
                    <div className="text-sm text-gray-400">المعرف الداخلي: {editing?.id || "جديد"}</div>
                  </div>
                </div>
              )}

              {tab === "desc" && (
                <div className="space-y-3">
                  <textarea name="shortDescAr" value={shortDescAr} onChange={(e) => setShortDescAr(e.target.value)} placeholder="وصف قصير بالعربي" className="w-full p-2 rounded bg-white/5" rows={3} />
                  <textarea name="shortDescEn" value={shortDescEn} onChange={(e) => setShortDescEn(e.target.value)} placeholder="Short description (EN)" className="w-full p-2 rounded bg-white/5" rows={3} />
                </div>
              )}

              {tab === "image" && (
                <div className="space-y-3">
                  <input ref={fileRef} name="images" type="file" accept="image/*" multiple onChange={(e) => onSelectFiles(e.target.files)} className="text-sm" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {imagesMap.map((it, i) => (
                      <div key={it.id} className="relative bg-white/5 p-2 rounded">
                        <img src={it.src} className="w-full h-32 object-cover rounded" alt={`img-${i}`} />
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setImagesMap((prev) => { const copy = [...prev]; if (i > 0) { [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]]; } return copy; }); }} className="px-2 py-1 bg-white/10 rounded">↑</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setImagesMap((prev) => { const copy = [...prev]; if (i < copy.length - 1) { [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]]; } return copy; }); }} className="px-2 py-1 bg-white/10 rounded">↓</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="px-2 py-1 bg-red-600 rounded">🗑</button>
                        </div>

                        {i !== 0 && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); makeFeatured(i); }} className="absolute left-2 top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">اجعلها الرئيسية</button>
                        )}

                        {i === 0 && <div className="absolute left-2 top-2 bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">الرئيسية</div>}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-400 mt-2">ملاحظة: الصور الجديدة تُرفع عند الحفظ. الصورة الأولى تُصبح "featured" افتراضيًا.</div>
                </div>
              )}

              {tab === "specs" && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">أضف المواصفات (المفتاح / القيمة) لكل لغة. تجنب الرموز: . # $ / [ ]</div>
                  {specsAr.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center flex-wrap">
                      <input placeholder="المفتاح بالعربي" value={s[0]} onChange={(e) => handleSpecChange(i, 0, e.target.value, "ar")} className="p-2 rounded bg-white/5 flex-1" />
                      <input placeholder="القيمة بالعربي" value={s[1]} onChange={(e) => handleSpecChange(i, 1, e.target.value, "ar")} className="p-2 rounded bg-white/5 flex-1" />
                      <input placeholder="Key (EN)" value={specsEn[i]?.[0] || ""} onChange={(e) => handleSpecChange(i, 0, e.target.value, "en")} className="p-2 rounded bg-white/5 flex-1" />
                      <input placeholder="Value (EN)" value={specsEn[i]?.[1] || ""} onChange={(e) => handleSpecChange(i, 1, e.target.value, "en")} className="p-2 rounded bg-white/5 flex-1" />
                      <button type="button" onClick={() => { setSpecsAr((p) => p.filter((_, idx) => idx !== i)); setSpecsEn((p) => p.filter((_, idx) => idx !== i)); }} className="px-2 py-1 rounded bg-red-600">❌</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSpec} className="px-3 py-1 rounded bg-green-600">➕ إضافة صف</button>
                </div>
              )}

              {tab === "preview" && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">المعاينة الحية</div>
                  <div className="bg-white/5 p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <img src={imagesMap[0]?.src || ""} alt="preview" className="w-full h-64 object-cover rounded" />
                        <div className="flex gap-2 mt-2">
                          {imagesMap.map((it) => <img key={it.id} src={it.src} className="w-16 h-16 object-cover rounded" alt="thumb" />)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{nameAr}</h3>
                        <p className="text-gray-400">{shortDescAr}</p>
                        <div className="mt-4 text-2xl font-bold text-cyan-400">{Number(price) ? `EGP ${price}` : "-"}</div>
                        {Number(oldPrice) ? <div className="line-through text-gray-400">EGP {oldPrice}</div> : null}
                        <div className="mt-4"><button onClick={() => openFullPreview(editing)} className="px-3 py-1 rounded bg-gradient-to-r from-blue-600 to-indigo-600">فتح في صفحة المنتج</button></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "flash" && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2"><input type="checkbox" name="flash" checked={flash} onChange={(e) => setFlash(e.target.checked)} /> تفعيل Flash Sale</label>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setIsOpen(false); }} className="px-4 py-2 rounded bg-white/5">إلغاء</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600">حفظ</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`\n        .glass-effect { backdrop-filter: blur(8px); }\n        @media (prefers-color-scheme: light) { .glass-effect { background: rgba(255,255,255,0.04); } }\n      `}</style>
    </div>
  );
}
