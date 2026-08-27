import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * False until real Firebase project config is set (see .env.example). Guarded
 * so a missing/placeholder config degrades to a clear on-screen message
 * instead of a blank white screen — `getAuth` throws synchronously on an
 * invalid API key, which otherwise crashes the whole app before it renders.
 */
export const firebaseConfigured = Boolean(firebaseConfig.apiKey)

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured yet — set the VITE_FIREBASE_* env vars.')
  }
  return auth
}

export function signInWithGoogle() {
  return signInWithPopup(requireAuth(), new GoogleAuthProvider())
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email, password)
}

export function signOut() {
  return firebaseSignOut(requireAuth())
}

export type { User }
