import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDY3UH8Xf-vy7kNKZ9aO2V4UhG86Myzg4",
  authDomain: "blog-app-demo-ccd53.firebaseapp.com",
  projectId: "blog-app-demo-ccd53",
  storageBucket: "blog-app-demo-ccd53.firebasestorage.app",
  messagingSenderId: "891372711025",
  appId: "1:891372711025:web:6674bd4ebedceb447dbfd0",
  measurementId: "G-81JXB26V4F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
