import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6dFcZXZjfe7ifEYFElPbOOMS2ysCW4rE",
  authDomain: "myposapp-f9f20.firebaseapp.com",
  projectId: "myposapp-f9f20",
  storageBucket: "myposapp-f9f20.appspot.com",
  messagingSenderId: "23307916827",
  appId: "1:23307916827:web:9e43f5e047218c3c48cabe",
  measurementId: "G-RV930H69FY"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);