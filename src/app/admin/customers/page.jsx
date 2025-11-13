// src/app/admin/customers/page.jsx
"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { ref, get } from "firebase/database";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const customersRef = ref(db, "customers");
    get(customersRef).then(snapshot => {
      if (snapshot.exists()) setCustomers(Object.entries(snapshot.val()));
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">العملاء</h1>
      <ul>
        {customers.map(([key, customer]) => (
          <li key={key} className="mb-2 p-2 border rounded">
            {customer.name[lang]} - {customer.email} - {customer.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}
