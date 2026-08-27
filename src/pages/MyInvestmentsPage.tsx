import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api/categories'
import { moveHoldingCategory, removeHolding, updateHoldingUnits } from '../api/holdings'
import { getHoldings, refreshPrices } from '../api/portfolio'
import { ApiError, type HoldingResponse } from '../api/types'
import { Button, Card, ErrorBanner, Page, Spinner, TextInput, formatDate, formatInr } from '../components/ui'

function HoldingRow({ holding }: { holding: HoldingResponse }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const [editing, setEditing] = useState(false)
  const [units, setUnits] = useState(String(holding.units))
  const [rowError, setRowError] = useState<string | null>(null)

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['holdings'] })
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  }

  function describe(err: unknown, fallback: string) {
    setRowError(err instanceof ApiError ? err.message : fallback)
  }

  const saveUnits = useMutation({
    mutationFn: () => updateHoldingUnits(holding.id, Number(units)),
    onSuccess: () => {
      invalidate()
      setEditing(false)
      setRowError(null)
    },
    onError: (err) => describe(err, "Couldn't save units"),
  })

  const moveCategory = useMutation({
    mutationFn: (categoryId: string) => moveHoldingCategory(holding.id, categoryId),
    onSuccess: () => {
      invalidate()
      setRowError(null)
    },
    onError: (err) => describe(err, "Couldn't move category"),
  })

  const remove = useMutation({
    mutationFn: () => removeHolding(holding.id),
    onSuccess: () => {
      invalidate()
      setRowError(null)
    },
    onError: (err) => describe(err, "Couldn't remove this investment"),
  })

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900">{holding.instrument.name}</div>
          <div className="text-xs text-slate-400">
            {editing ? null : `${holding.units} units`} · {formatInr(holding.valueInr)}
          </div>
        </div>
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          {remove.isPending ? 'Removing…' : 'Remove'}
        </button>
      </div>

      {rowError && <div className="mt-1 text-xs text-red-600">{rowError}</div>}
      {!holding.priced && <div className="mt-1 text-xs text-amber-600">No price yet</div>}
      {holding.priceAsOf && (
        <div className="mt-1 text-xs text-slate-400">Priced as of {formatDate(holding.priceAsOf)}</div>
      )}

      <div className="mt-2 flex items-center gap-2">
        {editing ? (
          <>
            <TextInput
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-24"
            />
            <Button className="w-auto shrink-0" disabled={saveUnits.isPending} onClick={() => saveUnits.mutate()}>
              Save
            </Button>
          </>
        ) : (
          <button type="button" className="text-xs text-brand-600 underline" onClick={() => setEditing(true)}>
            Edit units
          </button>
        )}

        <select
          className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-xs"
          value={holding.categoryId}
          onChange={(e) => moveCategory.mutate(e.target.value)}
        >
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  )
}

/** Screen 8 — My Investments. Holdings grouped by category. */
export function MyInvestmentsPage() {
  const queryClient = useQueryClient()
  const { data: holdings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['holdings'],
    queryFn: getHoldings,
  })
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  const refresh = useMutation({
    mutationFn: refreshPrices,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setRefreshMessage(
        result.failed > 0
          ? `Updated ${result.updated}, but ${result.failed} couldn't be priced right now.`
          : `Updated ${result.updated} price(s).`,
      )
    },
    onError: (err) =>
      setRefreshMessage(err instanceof ApiError ? err.message : "Couldn't refresh prices"),
  })

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <Page title="My investments">
        <ErrorBanner
          message={
            error instanceof ApiError
              ? error.message
              : "Couldn't load your investments. Check your connection and try again."
          }
        />
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </Page>
    )
  }

  const grouped = new Map<string, { name: string; holdings: HoldingResponse[] }>()
  for (const holding of holdings ?? []) {
    const bucket = grouped.get(holding.categoryId) ?? { name: holding.categoryName, holdings: [] }
    bucket.holdings.push(holding)
    grouped.set(holding.categoryId, bucket)
  }

  return (
    <Page title="My investments">
      {refreshMessage && (
        <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {refreshMessage}
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <Link to="/setup/holdings" className="text-sm text-brand-600 underline">
          + Add investment
        </Link>
        <button
          type="button"
          className="text-sm text-slate-500 disabled:opacity-50"
          disabled={refresh.isPending}
          onClick={() => refresh.mutate()}
        >
          {refresh.isPending ? 'Refreshing…' : 'Refresh prices'}
        </button>
      </div>

      {[...grouped.entries()].map(([categoryId, bucket]) => (
        <div key={categoryId} className="mb-5">
          <div className="mb-2 text-sm font-medium text-slate-700">{bucket.name}</div>
          <div className="space-y-2">
            {bucket.holdings.map((h) => (
              <HoldingRow key={h.id} holding={h} />
            ))}
          </div>
        </div>
      ))}

      {grouped.size === 0 && <p className="py-10 text-center text-sm text-slate-400">No investments yet.</p>}
    </Page>
  )
}
