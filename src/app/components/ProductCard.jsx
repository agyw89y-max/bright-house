"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProductCard({ p, onAdd, lang }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
      className="card-glass rounded-2xl p-3 min-w-[260px] max-w-[320px] cursor-pointer relative overflow-hidden"
    >
      <a href={`/product/${p.id}`} className="block rounded-xl overflow-hidden h-44 relative">
        <Image
          src={p.images?.[0] || "/placeholder.png"}

          alt={p.name?.[lang] || p.name?.ar || p.name?.en || "Product"}
          fill
          className="object-cover rounded-xl"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.2 }}
        />
      </a>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-gray-400">
              {p.categoryName?.[lang] || p.categoryName?.ar || p.categoryName?.en || ""}
            </div>
            <h3 className="font-semibold text-white mt-1 text-sm md:text-base line-clamp-2">
              {p.name?.[lang] || p.name?.ar || p.name?.en || "Unnamed"}
            </h3>

            {p.shortDescription?.[lang] && (
              <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                {p.shortDescription[lang] || p.shortDescription?.ar || p.shortDescription?.en || ""}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <div className="font-bold">EGP {p.price}</div>
              {p.oldPrice && <div className="text-gray-400 line-through text-sm">EGP {p.oldPrice}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAdd(p)}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-colors"
          >
            {lang === "ar" ? "أضف للعربة" : "Add to cart"}
          </motion.button>

          <div className="text-sm text-gray-300">{p.rating ? `${p.rating}★` : "4★"}</div>
        </div>
      </div>
    </motion.article>
  );
}
