import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8Pnf6n6aFSNXsCtp1qJh-IM-DJdQ46KM",
  authDomain: "homeherhealth-hub.firebaseapp.com",
  projectId: "homeherhealth-hub",
  storageBucket: "homeherhealth-hub.firebasestorage.app",
  messagingSenderId: "566321999383",
  appId: "1:566321999383:web:3ef7a87db4a462b59a7652",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);