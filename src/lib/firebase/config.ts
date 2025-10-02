
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-1877999514-cbce3',
  appId: '1:914581626043:web:12f763b79c00aaa9085d9e',
  apiKey: 'AIzaSyBTXSozIRpI_8jZXI2bMyl6C7FhkwUFzKc',
  authDomain: 'studio-1877999514-cbce3.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '914581626043'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
