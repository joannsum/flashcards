// pages/api/auth/firebase-token.js
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getClerkAuth } from '@clerk/nextjs/server';

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
  serviceAccount = {};
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export default async function handler(req, res) {
  console.log('Firebase token API route called');
  try {
    const auth = getClerkAuth({ req });
    const { userId } = auth;
    console.log('Clerk userId:', userId);
    if (!userId) {
      console.log('No userId found, returning 401');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = await getAuth().createCustomToken(userId);
    console.log('Custom token created successfully');
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in firebase-token API route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}