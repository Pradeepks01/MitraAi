import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBQJyTvILxge7C9zwLv7jKGGJh0n1yoCu8",
  authDomain: "mitraai-42c5a.firebaseapp.com",
  projectId: "mitraai-42c5a",
  storageBucket: "mitraai-42c5a.firebasestorage.app",
  messagingSenderId: "345717350669",
  appId: "1:345717350669:web:6f470c113179e833965044"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

