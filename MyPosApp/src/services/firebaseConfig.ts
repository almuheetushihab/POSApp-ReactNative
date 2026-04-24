import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6dFcZXZjfe7ifEYFElPbOOMS2ysCW4rE",
  authDomain: "myposapp-f9f20.firebaseapp.com",
  projectId: "myposapp-f9f20",
  storageBucket: "myposapp-f9f20.appspot.com",
  messagingSenderId: "23307916827",
  appId: "1:23307916827:web:9e43f5e047218c3c48cabe",
  measurementId: "G-RV930H69FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth;

try {
  if (Platform.OS !== 'web') {
    const { getReactNativePersistence } = require('firebase/auth/react-native');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    auth = getAuth(app);
  }
} catch (e) {
  console.error("Failed to initialize auth with persistence:", e);
  // Fallback for environments where react-native module is not available
  auth = getAuth(app);
}


export { auth };