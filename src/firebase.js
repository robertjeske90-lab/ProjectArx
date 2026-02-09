import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB_YyB0aQmcDibiA217FMLStiMfoLtnlmk",
  authDomain: "arx-pnp-3ff64.firebaseapp.com",
  projectId: "arx-pnp-3ff64",
  storageBucket: "arx-pnp-3ff64.firebasestorage.app",
  messagingSenderId: "293460542456",
  appId: "1:293460542456:web:fafff2c9a0be5850dc0c0d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
