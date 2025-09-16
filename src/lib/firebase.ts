
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "prosport-portfolio.firebaseapp.com",
  projectId: "prosport-portfolio",
  storageBucket: "prosport-portfolio.firebasestorage.app",
  messagingSenderId: "785009102684",
  appId: "1:785009102684:web:ff389cc050c0978090bb99",
};

// Inicialize o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
