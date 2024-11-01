import { initializeApp, getApps, getApp  } from 'firebase/app';
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4VoWyBW2jfjZFrOrhTAlRKbqPphm54eA",
  authDomain: "e-book-store-40f14.firebaseapp.com",
  projectId: "e-book-store-40f14",
  storageBucket: "e-book-store-40f14.appspot.com",
  messagingSenderId: "829407492767",
  appId: "1:829407492767:web:c64adeb4558128a85280aa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, db, storage };
