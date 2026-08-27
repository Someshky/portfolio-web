import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, putCategories } from '../api/categories'
import { ApiError } from '../api/types'
import { Button, Card, ErrorBanner, Page, TextInput } from '../components/ui'

interface Row {
  id: string | null
  name: string
  targetPercent: string
}

const EXAMPLE: Row[] = [
  { id: null, name: 'Equity', targetPercent: '60' },
  { id: null, name: 'Bonds', targetPercent: '30' },
  { id: null, name: 'Gold', targetPercent: '10' },
]

/** Screen 2 — Your Target Allocation. Rule 2: percentages must total exactly 100. */
export function TargetAllocationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    data: categories,
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (categories) {
      setRows(
        categories.length > 0
          ? categories
              .slice()
              .sort((a, b) => b.targetPercent - a.targetPercent)
              .map((c) => ({ id: c.id, name: c.name, targetPercent: String(c.targetPercent) }))
          : [],
      )
    }
  }, [categories])

  const save = useMutation({
    mutationFn: () =>
      putCategories(
        rows.map((r) => ({ id: r.id, name: r.name, targetPercent: Number(r.targetPercent) || 0 })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      navigate('/setup/holdings')
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not save targets'),
  })

  const total = rows.reduce((sum, r) => sum + (Number(r.targetPercent) || 0), 0)
  const canSave = rows.length > 0 && Math.abs(total - 100) < 0.001

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) return <Page title="Your target allocation" onBack={() => navigate(-1)}>Loading…</Page>

  if (isError) {
    return (
      <Page title="Your target allocation" onBack={() => navigate(-1)}>
        <ErrorBanner
          message={
            loadError instanceof ApiError
              ? loadError.message
              : "Couldn't load your categories. Check your connection and try again."
          }
        />
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </Page>
    )
  }

  return (
    <Page title="Your target allocation" onBack={() => navigate(-1)}>
      <p className="mb-4 text-sm text-slate-500">How do you want to divide your portfolio?</p>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {rows.length === 0 && (
        <button
          type="button"
          className="mb-4 text-sm text-brand-600 underline"
          onClick={() => setRows(EXAMPLE)}
        >
          Not sure where to start? See a simple example
        </button>
      )}

      <div className="space-y-2">
        {rows.map((row, i) => (
          <Card key={i} className="flex items-center gap-2 p-3">
            <TextInput
              placeholder="Category name"
              value={row.name}
              onChange={(e) => updateRow(i, { name: e.target.value })}
              className="flex-1"
            />
            <TextInput
              type="number"
              placeholder="%"
              value={row.targetPercent}
              onChange={(e) => updateRow(i, { targetPercent: e.target.value })}
              className="w-20 text-right"
            />
            <button
              type="button"
              aria-label="Remove category"
              className="px-1 text-slate-400 hover:text-red-600"
              onClick={() => removeRow(i)}
            >
              ✕
            </button>
          </Card>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600"
        onClick={() => setRows((prev) => [...prev, { id: null, name: '', targetPercent: '' }])}
      >
        + Add category
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">Total</span>
        <span className={total === 100 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
          {total}%
        </span>
      </div>

      <div className="mt-6">
        <Button disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? 'Saving…' : 'Save and continue'}
        </Button>
      </div>
    </Page>
  )
}
