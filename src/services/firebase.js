import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDIzpFVHVX6ptZ9p4RPi0PMgjr7puU1Y_s',
  authDomain: 'dashboard-sunset.firebaseapp.com',
  projectId: 'dashboard-sunset',
  storageBucket: 'dashboard-sunset.firebasestorage.app',
  messagingSenderId: '716520694630',
  appId: '1:716520694630:web:7a500ac5aaf0d379d89ea7',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
