"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase"; // تأكد أن هذا المسار صحيح عندك
import { ref, onValue, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * Admin single page: manage categories (array/object), heroProduct, salesSlider
 * - Upload image: Cloudinary unsigned preset 'unsigned_electro' (مثل اللي عندك)
 * - Uses set(ref(db, path), data) to write back modified arrays/objects
 *
 * Important: adapt path to firebase import if needed.
 */

export default function AdminAdminPage() {
  // data states
  const [categories, setCategories] = useState([]); // array of { id, image, name:{ar,en}, order? }
  const [heroProduct, setHeroProduct] = useState(null); // object
  const [salesSlider, setSalesSlider] = useState([]); // array of slides

  // UI states
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'category' | 'hero' | 'slide'
  const [currentItem, setCurrentItem] = useState(null); // item being edited
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- Load data from Firebase (individual refs) ---
  useEffect(() => {
    const catRef = ref(db, "categories");
    const heroRef = ref(db, "heroProduct");
    const sliderRef = ref(db, "salesSlider");

    const unsubCats = onValue(catRef, (snap) => {
      const val = snap.val();
      if (val == null) {
        setCategories([]);
        return;
      }
      // If it's an array already
      if (Array.isArray(val)) {
        // ensure each item has id (if not, create fallback)
        const arr = val.map((it, i) => {
          if (!it) return null;
          return it.id ? it : { id: it.id || `cat${i}`, ...it };
        }).filter(Boolean);
        setCategories(arr);
      } else if (typeof val === "object") {
        // object could be either { id: {...} } (push-keys) or plain object with numeric keys
        // Convert entries to array preserving keys as id if needed
        const arr = Object.entries(val).map(([key, value]) => {
          // If value already has an id property and it's same as key, keep it
          if (value && typeof value === "object") {
            return { id: value.id || key, ...value };
          }
          return { id: key, ...value };
        });
        setCategories(arr);
      } else {
        setCategories([]);
      }
    });

    const unsubHero = onValue(heroRef, (snap) => {
      setHeroProduct(snap.val() || null);
    });

    const unsubSlider = onValue(sliderRef, (snap) => {
      const v = snap.val();
      if (!v) {
        setSalesSlider([]);
      } else if (Array.isArray(v)) {
        setSalesSlider(v.filter(Boolean));
      } else if (typeof v === "object") {
        // if object with keys -> convert to array
        const arr = Object.entries(v).map(([k, val]) => ({ id: val.id || k, ...val }));
        setSalesSlider(arr);
      }
    });

    return () => {
      unsubCats();
      unsubHero();
      unsubSlider();
    };
  }, []);

  // ---------- Helpers ----------
  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "unsigned_electro");
      const res = await fetch("https://api.cloudinary.com/v1_1/dqp0mtqdn/image/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      setUploading(false);
      if (json.secure_url) return json.secure_url;
      throw new Error("Upload failed");
    } catch (err) {
      setUploading(false);
      console.error("Cloudinary upload error:", err);
      alert("خطأ في رفع الصورة. تأكد من إعداد Cloudinary.");
      return null;
    }
  };

  // Save full categories array back to DB
  const saveCategoriesToDB = async (newArray) => {
    try {
      await set(ref(db, "categories"), newArray);
      alert("✅ تم حفظ الأقسام.");
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ الأقسام في قاعدة البيانات.");
    }
  };

  // Save heroProduct
  const saveHeroToDB = async (obj) => {
    try {
      await set(ref(db, "heroProduct"), obj);
      alert("✅ تم حفظ المنتج البطل.");
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ المنتج البطل.");
    }
  };

  // Save slider
  const saveSliderToDB = async (arr) => {
    try {
      await set(ref(db, "salesSlider"), arr);
      alert("✅ تم حفظ شرائح السلايدر.");
    } catch (err) {
      console.error(err);
      alert("❌ فشل حفظ السلايدر.");
    }
  };

  // ---------- Category actions ----------
  const openAddCategory = () => {
    setCurrentItem({ id: `cat${Date.now()}`, name: { ar: "", en: "" }, image: "" });
    setPreviewImage(null);
    setModalType("category");
    setModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setCurrentItem({ ...cat });
    setPreviewImage(cat.image || null);
    setModalType("category");
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e && e.preventDefault();
    if (!currentItem) return;
    const form = e ? e.target : null;
    let nameAr = form?.nameAr?.value ?? currentItem.name?.ar ?? "";
    let nameEn = form?.nameEn?.value ?? currentItem.name?.en ?? "";
    const file = form?.image?.files?.[0] ?? null;

    // basic validation
    if (!nameAr && !nameEn) {
      alert("أدخل اسم القسم على الأقل بالعربية أو الإنجليزية.");
      return;
    }

    let imageUrl = currentItem.image || "";
    if (file) {
      const uploaded = await uploadToCloudinary(file);
      if (uploaded) imageUrl = uploaded;
    }

    // Update categories array in-memory
    const foundIndex = categories.findIndex((c) => c.id === currentItem.id);
    const newItem = {
      ...currentItem,
      id: currentItem.id || `cat${Date.now()}`,
      name: { ar: nameAr, en: nameEn },
      image: imageUrl,
    };

    let newCats;
    if (foundIndex >= 0) {
      newCats = [...categories];
      newCats[foundIndex] = { ...newCats[foundIndex], ...newItem };
    } else {
      newCats = [...categories, { ...newItem }];
    }

    await saveCategoriesToDB(newCats);
    setModalOpen(false);
    setCurrentItem(null);
    setPreviewImage(null);
  };

  const handleDeleteCategory = async (cat) => {
    if (!cat?.id) return alert("لا يوجد معرف للحذف.");
    if (!confirm("هل تريد حذف هذا القسم؟")) return;
    // remove by id
    const newCats = categories.filter((c) => c.id !== cat.id);
    await saveCategoriesToDB(newCats);
  };

  // ---------- Hero actions ----------
  const openEditHero = () => {
    setCurrentItem(heroProduct || {
      id: `hero${Date.now()}`,
      name: { ar: "", en: "" },
      shortDescription: { ar: "", en: "" },
      description: { ar: "", en: "" },
      image: "",
      price: 0,
      oldPrice: 0,
      flash: false,
      flashText: { ar: "", en: "" },
      rating: 0,
      specs: { ar: {}, en: {} },
    });
    setPreviewImage(heroProduct?.image || null);
    setModalType("hero");
    setModalOpen(true);
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    const form = e.target;
    const nameAr = form.nameAr.value;
    const nameEn = form.nameEn.value;
    const shortAr = form.shortAr.value;
    const shortEn = form.shortEn.value;
    const descAr = form.descAr.value;
    const descEn = form.descEn.value;
    const price = Number(form.price.value || 0);
    const oldPrice = Number(form.oldPrice.value || 0);
    const flash = !!form.flash.checked;
    const flashAr = form.flashAr.value;
    const flashEn = form.flashEn.value;
    const file = form.image.files[0];

    let imageUrl = currentItem?.image || "";

    if (file) {
      const up = await uploadToCloudinary(file);
      if (up) imageUrl = up;
    }

    const heroObj = {
      id: currentItem?.id || `hero${Date.now()}`,
      name: { ar: nameAr, en: nameEn },
      shortDescription: { ar: shortAr, en: shortEn },
      description: { ar: descAr, en: descEn },
      image: imageUrl,
      price,
      oldPrice,
      flash,
      flashText: { ar: flashAr, en: flashEn },
      rating: Number(form.rating.value || 0),
      specs: currentItem?.specs || {},
    };

    await saveHeroToDB(heroObj);
    setModalOpen(false);
    setCurrentItem(null);
    setPreviewImage(null);
  };

  const handleClearHero = async () => {
    if (!confirm("هل تريد إزالة المنتج البطل بالكامل؟")) return;
    await saveHeroToDB(null);
    alert("تم إزالة المنتج البطل.");
  };

  // ---------- Slider actions ----------
  const openAddSlide = () => {
    setCurrentItem({ id: `slide${Date.now()}`, title: { ar: "", en: "" }, subtitle: { ar: "", en: "" }, image: "", link: "" });
    setPreviewImage(null);
    setModalType("slide");
    setModalOpen(true);
  };

  const openEditSlide = (slide) => {
    setCurrentItem({ ...slide });
    setPreviewImage(slide.image || null);
    setModalType("slide");
    setModalOpen(true);
  };

  const handleSaveSlide = async (e) => {
    e && e.preventDefault();
    const form = e ? e.target : null;
    const titleAr = form?.titleAr?.value ?? currentItem.title?.ar ?? "";
    const titleEn = form?.titleEn?.value ?? currentItem.title?.en ?? "";
    const subAr = form?.subAr?.value ?? currentItem.subtitle?.ar ?? "";
    const subEn = form?.subEn?.value ?? currentItem.subtitle?.en ?? "";
    const link = form?.link?.value ?? currentItem.link ?? "";
    const file = form?.image?.files?.[0] ?? null;

    let imageUrl = currentItem.image || "";
    if (file) {
      const uploaded = await uploadToCloudinary(file);
      if (uploaded) imageUrl = uploaded;
    }

    const newSlide = {
      id: currentItem.id || `slide${Date.now()}`,
      title: { ar: titleAr, en: titleEn },
      subtitle: { ar: subAr, en: subEn },
      image: imageUrl,
      link,
    };

    const foundIndex = salesSlider.findIndex((s) => s.id === newSlide.id);
    let newSlides;
    if (foundIndex >= 0) {
      newSlides = [...salesSlider];
      newSlides[foundIndex] = { ...newSlides[foundIndex], ...newSlide };
    } else {
      newSlides = [...salesSlider, newSlide];
    }

    await saveSliderToDB(newSlides);
    setModalOpen(false);
    setCurrentItem(null);
    setPreviewImage(null);
  };

  const handleDeleteSlide = async (slide) => {
    if (!slide?.id) return alert("لا يوجد معرف للحذف.");
    if (!confirm("هل تريد حذف هذه الشريحة؟")) return;
    const newSlides = salesSlider.filter((s) => s.id !== slide.id);
    await saveSliderToDB(newSlides);
  };

  // ---------- small UI helpers ----------
  const openModalFor = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setPreviewImage(item?.image || null);
    setModalOpen(true);
  };

  // ---------- Render ----------
  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">لوحة تحكم الموقع — إدارة كاملة</h1>
          <div className="flex gap-2">
            <button onClick={() => { setLoading(true); setTimeout(()=>setLoading(false),500) }} className="px-3 py-2 bg-gray-800 rounded">تحديث</button>
          </div>
        </header>

        {/* HERO */}
        <section className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">المنتج البطل (heroProduct)</h2>
            <div className="flex gap-2">
              <button onClick={openEditHero} className="px-3 py-1 bg-blue-600 rounded">تعديل</button>
              <button onClick={handleClearHero} className="px-3 py-1 bg-red-600 rounded">إزالة</button>
            </div>
          </div>

          {heroProduct ? (
            <div className="flex gap-4 items-center">
              <img src={heroProduct.image || "/placeholder.jpg"} alt="hero" className="w-36 h-24 object-cover rounded" />
              <div>
                <div className="font-semibold">{heroProduct.name?.ar || heroProduct.name?.en}</div>
                <div className="text-sm text-gray-400">{heroProduct.shortDescription?.ar || heroProduct.shortDescription?.en}</div>
                <div className="mt-2">
                  <span className="font-bold">{heroProduct.price} </span>
                  {heroProduct.oldPrice ? <span className="line-through text-gray-400 ml-2">{heroProduct.oldPrice}</span> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">لا يوجد منتج بطل مسجّل حالياً.</div>
          )}
        </section>

        {/* SALES SLIDER */}
        <section className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">سلايدر العروض (salesSlider)</h2>
            <button onClick={openAddSlide} className="px-3 py-1 bg-green-600 rounded">➕ إضافة شريحة</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {salesSlider.length === 0 && <div className="text-gray-400">لا توجد شرائح.</div>}
            {salesSlider.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-gray-800 p-3 rounded">
                <img src={s.image || "/placeholder.jpg"} alt="slide" className="w-28 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{s.title?.ar || s.title?.en}</div>
                  <div className="text-sm text-gray-400">{s.subtitle?.ar || s.subtitle?.en}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditSlide(s)} className="px-2 py-1 bg-yellow-500 rounded">تعديل</button>
                  <button onClick={() => handleDeleteSlide(s)} className="px-2 py-1 bg-red-600 rounded">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
  {/* ================= CATEGORIES SECTION ================= */}
{/* ================= CATEGORIES SECTION WITH PULSE ================= */}
<section className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-xl font-semibold">الأقسام (categories)</h2>
    <button onClick={openAddCategory} className="px-3 py-1 bg-blue-600 rounded">
      ➕ إضافة قسم
    </button>
  </div>

  <DragDropContext
    onDragEnd={(result) => {
      if (!result.destination) return;
      const items = Array.from(categories);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setCategories(items);
    }}
  >
    <Droppable droppableId="categories-droppable">
      {(provided) => (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {categories.map((cat, index) => (
            <Draggable key={cat.id} draggableId={cat.id} index={index}>
              {(provided, snapshot) => (
                <motion.div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  layout
                  initial={{ scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }}
                  animate={{
                    scale: snapshot.isDragging ? 1.05 : 1,
                    boxShadow: snapshot.isDragging
                      ? "0 0 15px rgba(59, 130, 246, 0.6)"
                      : "0 0 0px rgba(0,0,0,0)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="bg-gray-800 p-3 rounded-lg flex flex-col items-center"
                >
                  <img
                    src={cat.image || "/placeholder.jpg"}
                    alt="cat"
                    className="w-full h-36 object-cover rounded mb-3"
                  />
                  <div className="text-center">
                    <div className="font-semibold">{cat.name?.ar || cat.name?.en || "بدون اسم"}</div>
                    <div className="text-sm text-gray-400">id: {cat.id}</div>
                  </div>

                  <div className="flex gap-2 mt-3 w-full">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="flex-1 bg-yellow-500 py-1 rounded"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex-1 bg-red-600 py-1 rounded"
                    >
                      حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(`/admin/products/${cat.id}`, "_blank")}
                      className="flex-1 bg-green-600 rounded"
                    >
                      عرض المنتجات
                    </button>
                  </div>

                  {/* أسهم ترتيب */}
                  <div className="flex gap-2 mt-2 w-full justify-center">
                    <button
                      disabled={index === 0}
                      onClick={() => {
                        const newCats = [...categories];
                        [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
                        setCategories(newCats);
                      }}
                      className="px-2 py-1 bg-gray-600 rounded disabled:opacity-50"
                    >
                      ⬆️
                    </button>
                    <button
                      disabled={index === categories.length - 1}
                      onClick={() => {
                        const newCats = [...categories];
                        [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
                        setCategories(newCats);
                      }}
                      className="px-2 py-1 bg-gray-600 rounded disabled:opacity-50"
                    >
                      ⬇️
                    </button>
                  </div>
                </motion.div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>

  {/* زر حفظ الترتيب */}
  {categories.length > 0 && (
    <div className="mt-4 text-center">
      <button
        onClick={() => saveCategoriesToDB(categories)}
        className="px-4 py-2 bg-green-600 rounded"
      >
        💾 حفظ الأقسام
      </button>
    </div>
  )}
</section>


      </div>

      {/* ---------- Modal (single modal used for categories / hero / slides) ---------- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="relative z-10 bg-gray-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-gray-800">
                  {/* زر عرض المنتجات */}



          {/* Category form */}
{modalType === "category" && currentItem && (
  <>
    <h3 className="text-xl font-bold mb-3">{currentItem?.id ? "تعديل قسم" : "إضافة قسم"}</h3>
    <form onSubmit={handleSaveCategory} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input name="nameAr" defaultValue={currentItem.name?.ar || ""} placeholder="اسم بالعربية" className="p-2 bg-gray-800 rounded" />
        <input name="nameEn" defaultValue={currentItem.name?.en || ""} placeholder="Name in English" className="p-2 bg-gray-800 rounded" />
      </div>
      <div>
        <input type="file" name="image" accept="image/*" onChange={(e) => setPreviewImage(URL.createObjectURL(e.target.files[0]))} />
      </div>
      {previewImage && <img src={previewImage} alt="preview" className="w-48 h-36 object-cover rounded" />}

      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => { setModalOpen(false); setCurrentItem(null); setPreviewImage(null); }} className="px-3 py-1 bg-gray-700 rounded">إلغاء</button>
          <button type="submit" disabled={uploading} className="px-3 py-1 bg-blue-600 rounded">{uploading ? "جاري رفع الصورة..." : "حفظ"}</button>
        </div>


      </div>
    </form>
  </>
)}

              {/* Hero form */}
              {modalType === "hero" && (
                <>
                  <h3 className="text-xl font-bold mb-3">تعديل المنتج البطل</h3>
                  <form onSubmit={handleSaveHero} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="nameAr" defaultValue={currentItem?.name?.ar || ""} placeholder="اسم بالعربية" className="p-2 bg-gray-800 rounded" />
                      <input name="nameEn" defaultValue={currentItem?.name?.en || ""} placeholder="Name in English" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="shortAr" defaultValue={currentItem?.shortDescription?.ar || ""} placeholder="وصف قصير AR" className="p-2 bg-gray-800 rounded" />
                      <input name="shortEn" defaultValue={currentItem?.shortDescription?.en || ""} placeholder="short desc EN" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="price" type="number" defaultValue={currentItem?.price || 0} placeholder="السعر" className="p-2 bg-gray-800 rounded" />
                      <input name="oldPrice" type="number" defaultValue={currentItem?.oldPrice || 0} placeholder="السعر القديم" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="flashAr" defaultValue={currentItem?.flashText?.ar || ""} placeholder="نص فلاش AR" className="p-2 bg-gray-800 rounded" />
                      <input name="flashEn" defaultValue={currentItem?.flashText?.en || ""} placeholder="flash text EN" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input name="flash" type="checkbox" defaultChecked={currentItem?.flash || false} />
                        <span>فلاش</span>
                      </label>
                    </div>

                    <div>
                      <textarea name="descAr" defaultValue={currentItem?.description?.ar || ""} placeholder="الوصف الكامل AR" className="w-full p-2 bg-gray-800 rounded" />
                      <textarea name="descEn" defaultValue={currentItem?.description?.en || ""} placeholder="description EN" className="w-full p-2 bg-gray-800 rounded mt-2" />
                    </div>

                    <div>
                      <input type="file" name="image" accept="image/*" onChange={(e) => setPreviewImage(URL.createObjectURL(e.target.files[0]))} />
                    </div>
                    {previewImage && <img src={previewImage} alt="preview" className="w-48 h-36 object-cover rounded" />}

                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 bg-gray-700 rounded">إلغاء</button>
                      <button type="submit" disabled={uploading} className="px-3 py-1 bg-blue-600 rounded">{uploading ? "جاري رفع..." : "حفظ"}</button>
                    </div>
                  </form>
                </>
              )}

              {/* Slide form */}
              {modalType === "slide" && currentItem && (
                <>
                  <h3 className="text-xl font-bold mb-3">{currentItem?.id ? "تعديل الشريحة" : "إضافة شريحة"}</h3>
                  <form onSubmit={handleSaveSlide} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="titleAr" defaultValue={currentItem.title?.ar || ""} placeholder="عنوان AR" className="p-2 bg-gray-800 rounded" />
                      <input name="titleEn" defaultValue={currentItem.title?.en || ""} placeholder="title EN" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input name="subAr" defaultValue={currentItem.subtitle?.ar || ""} placeholder="نص فرعي AR" className="p-2 bg-gray-800 rounded" />
                      <input name="subEn" defaultValue={currentItem.subtitle?.en || ""} placeholder="subtitle EN" className="p-2 bg-gray-800 rounded" />
                    </div>

                    <input name="link" defaultValue={currentItem.link || ""} placeholder="/sales" className="p-2 bg-gray-800 rounded w-full" />
                    <div>
                      <input type="file" name="image" accept="image/*" onChange={(e) => setPreviewImage(URL.createObjectURL(e.target.files[0]))} />
                    </div>
                    {previewImage && <img src={previewImage} alt="preview" className="w-48 h-36 object-cover rounded" />}

                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 bg-gray-700 rounded">إلغاء</button>
                      <button type="submit" disabled={uploading} className="px-3 py-1 bg-blue-600 rounded">{uploading ? "جاري رفع..." : "حفظ"}</button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

