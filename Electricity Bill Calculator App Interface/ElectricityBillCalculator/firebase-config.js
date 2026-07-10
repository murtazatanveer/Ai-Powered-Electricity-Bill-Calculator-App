import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIG4f1o3J0786xOKZU6ytOzsocbCsXb-g",
  authDomain: "myfirstproject-dc19d.firebaseapp.com",
  projectId: "myfirstproject-dc19d",
  storageBucket: "myfirstproject-dc19d.firebasestorage.app",
  messagingSenderId: "28730944038",
  appId: "1:28730944038:web:c70b3175329295ccfa54e7",
  measurementId: "G-TVK81FK5XM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
