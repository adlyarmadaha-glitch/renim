import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBOg_ybCiQhEsG36Tl4nagZunSS3m-T7_U",
  authDomain: "renimev2.firebaseapp.com",
  projectId: "renimev2",
  storageBucket: "renimev2.firebasestorage.app",
  messagingSenderId: "1055671115089",
  appId: "1:1055671115089:web:83cf7f7c945d4607f88770"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;