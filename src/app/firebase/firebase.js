// ✅ Import Firebase SDKs مرة واحدة فقط
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeHRGcDPjP-K7ZSOnSDFOGDS50uGoaUA4",
  authDomain: "bright-house-e1c41.firebaseapp.com",
  databaseURL: "https://bright-house-e1c41-default-rtdb.firebaseio.com",
  projectId: "bright-house-e1c41",
  storageBucket: "bright-house-e1c41.firebasestorage.app",
  messagingSenderId: "360239004823",
  appId: "1:360239004823:web:8fa0d4110af87f79f67dd2",
  measurementId: "G-4M3MGFH1PD"
};





// ✅ نتاكد إننا بننشئ التطبيق مرة واحدة فقط
const app = initializeApp(firebaseConfig);

// 🧠 إعداد الخدمات
export const db = getDatabase(app);
export const auth = getAuth(app);

// 🔥 ضبط حفظ الجلسة في localStorage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase persistence set to localStorage");
  })
  .catch((error) => {
    console.error("❌ Error setting persistence:", error);
  });

// 📤 التصدير الافتراضي
export default app;