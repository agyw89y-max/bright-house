// src/app/admin/offers/page.jsx
"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { ref, get, remove } from "firebase/database";

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const lang = "ar"; // اختر اللغة

  useEffect(() => {
    const offersRef = ref(db, "offers");
    get(offersRef).then(snapshot => {
      if (snapshot.exists()) setOffers(Object.entries(snapshot.val()));
    });
  }, []);

  const deleteOffer = (id) => {
    remove(ref(db, "offers/" + id));
    setOffers(offers.filter(([key]) => key !== id));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">العروض</h1>
      <ul>
        {offers.map(([key, offer]) => (
          <li key={key} className="flex justify-between mb-2 p-2 border rounded">
            {offer.title[lang]} - {offer.discount}%
            <button onClick={() => deleteOffer(key)} className="bg-red-500 text-white px-2 rounded">حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
