import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCBhSuihsTggGUHRWPmCzzZwUK_Xx8orPU",
  authDomain: "toyproject-f3786.firebaseapp.com",
  projectId: "toyproject-f3786",
  storageBucket: "toyproject-f3786.appspot.com",
  messagingSenderId: "36022671179",
  appId: "1:36022671179:web:5839d785b1096213bc7ace",
  measurementId: "G-9CG91X4FMW"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = getFirestore(app);

export { auth, firestore };