import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function signInWithClerk() {
    console.log('Attempting to sign in with Clerk');
    try {
      const response = await fetch('/api/auth/firebase-token');
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response text:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data from API:', data);
      if (!data.token) {
        throw new Error('No token received from API');
      }
      await signInWithCustomToken(auth, data.token);
      console.log('Successfully signed in with Clerk');
    } catch (error) {
      console.error('Error signing in with Clerk:', error);
    }
  }
  
  export { db, auth, signInWithClerk };