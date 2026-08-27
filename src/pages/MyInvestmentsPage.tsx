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

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['holdings'] })
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  }

  const saveUnits = useMutation({
    mutationFn: () => updateHoldingUnits(holding.id, Number(units)),
    onSuccess: () => {
      invalidate()
      setEditing(false)
    },
  })

  const moveCategory = useMutation({
    mutationFn: (categoryId: string) => moveHoldingCategory(holding.id, categoryId),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: () => removeHolding(holding.id),
    onSuccess: invalidate,
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
          className="text-xs text-slate-400 hover:text-red-600"
          onClick={() => remove.mutate()}
        >
          Remove
        </button>
      </div>

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

  const refresh = useMutation({
    mutationFn: refreshPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
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
