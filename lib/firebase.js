import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

// These values come from your Vercel environment variables
// They are all NEXT_PUBLIC_ so the browser can read them
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Prevent initialising the app more than once (Next.js hot reload safety)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Sign in with Google — opens a popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user  // { uid, displayName, email, photoURL }
}

export async function firebaseSignOut() {
  await signOut(auth)
}

export { auth }
