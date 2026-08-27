import { onAuthStateChanged } from 'firebase/auth'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { auth, firebaseConfigured, type User } from '../firebase'

interface AuthState {
  user: User | null
  loading: boolean
  configured: boolean
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: firebaseConfigured })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(firebaseConfigured)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, configured: firebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

/** The bearer token every API call needs — null while signed out. */
export async function currentIdToken(): Promise<string | null> {
  const user = auth?.currentUser
  return user ? user.getIdToken() : null
}
