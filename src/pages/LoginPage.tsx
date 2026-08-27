import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button, ErrorBanner, TextInput } from '../components/ui'
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../firebase'

/** Screen 1 — Welcome / Login. §3: login is required, no "try it first" demo. */
export function LoginPage() {
  const { user, loading, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function withErrorHandling(action: () => Promise<unknown>) {
    setError(null)
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6">
      <div className="mb-8 font-serif text-xl text-stone-900">Portfolio.</div>
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
          Invest with a plan
        </p>
        <h1 className="mb-3 font-serif text-4xl leading-[1.1] text-stone-900">
          Invest consistently.
          <br />
          Stay aligned with your plan.
        </h1>
        <p className="text-sm text-stone-500">
          See where your next investment should go, based on the targets you choose.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!configured && (
        <div className="mb-4">
          <ErrorBanner message="Firebase isn't configured yet. Set VITE_FIREBASE_* in .env.local (see .env.example) with your Firebase project's web config." />
        </div>
      )}

      <div className="space-y-3">
        <Button
          variant="secondary"
          disabled={busy || !configured}
          onClick={() => withErrorHandling(signInWithGoogle)}
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 py-1 text-xs text-stone-400">
          <div className="h-px flex-1 bg-stone-200" />
          or with email
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <TextInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          disabled={busy || !configured || !email || !password}
          onClick={() =>
            withErrorHandling(() =>
              mode === 'signin' ? signInWithEmail(email, password) : signUpWithEmail(email, password),
            )
          }
        >
          {mode === 'signin' ? 'Continue with Email' : 'Create account'}
        </Button>

        <button
          type="button"
          className="w-full text-center text-xs text-stone-500"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
