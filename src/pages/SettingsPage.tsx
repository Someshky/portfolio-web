import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteAccount, getMe } from '../api/account'
import { ApiError } from '../api/types'
import { Button, Card, ErrorBanner, Page } from '../components/ui'
import { auth, signOut } from '../firebase'

/** Screen 9 — Settings. */
export function SettingsPage() {
  const navigate = useNavigate()
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = useMutation({
    mutationFn: async () => {
      await deleteAccount()
      // The API only removes the app's own data — the sign-in identity is a
      // separate system, so it must be deleted here too.
      if (auth?.currentUser) {
        await auth.currentUser.delete()
      }
    },
    onSuccess: () => navigate('/login'),
    onError: (err) =>
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not delete your account. You may need to sign in again first, then retry.',
      ),
  })

  return (
    <Page title="Settings">
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="space-y-2">
        <Link to="/setup/categories">
          <Card className="p-3 text-sm font-medium text-slate-900">Target allocation</Card>
        </Link>
        <Link to="/holdings">
          <Card className="p-3 text-sm font-medium text-slate-900">My investments</Card>
        </Link>
      </div>

      <Card className="mt-6">
        <div className="text-xs text-slate-400">Signed in as</div>
        <div className="text-sm font-medium text-slate-900">{me?.email ?? '—'}</div>
        <Button variant="secondary" className="mt-3" onClick={() => signOut().then(() => navigate('/login'))}>
          Sign out
        </Button>
      </Card>

      <Card className="mt-6 border-red-100">
        <div className="text-sm font-medium text-red-700">Delete account</div>
        <p className="mt-1 text-xs text-slate-500">
          Permanently removes your account and portfolio data. This cannot be undone.
        </p>
        {confirmingDelete ? (
          <div className="mt-3 space-y-2">
            <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? 'Deleting…' : 'Yes, permanently delete my account'}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" className="mt-3" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </Button>
        )}
      </Card>
    </Page>
  )
}
