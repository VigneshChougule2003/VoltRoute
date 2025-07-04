// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTeaYmZA8NRUV71KN6A5x3ObtTeFqrE_I",
  authDomain: "voltroute.firebaseapp.com",
  projectId: "voltroute",
  storageBucket: "voltroute.firebasestorage.app",
  messagingSenderId: "1078623919976",
  appId: "1:1078623919976:web:ed21c24f10d529dc21c0dd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
