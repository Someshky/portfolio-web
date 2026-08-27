import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { searchInstruments } from '../api/instruments'
import {
  cancelPlan,
  completeCategory,
  completePlan,
  getPlan,
  recordPurchase,
} from '../api/plans'
import { ApiError, type InstrumentResponse, type PlanItemResponse } from '../api/types'
import { Button, Card, ErrorBanner, Page, TextInput, formatInr } from '../components/ui'

function RecordPurchaseRow({
  planId,
  item,
  readOnly,
}: {
  planId: string
  item: PlanItemResponse
  readOnly: boolean
}) {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InstrumentResponse[]>([])
  const [instrument, setInstrument] = useState<InstrumentResponse | null>(null)
  const [units, setUnits] = useState('')
  const [open, setOpen] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)

  const record = useMutation({
    mutationFn: () => recordPurchase(planId, item.id, instrument!.id, Number(units)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
      setOpen(false)
      setInstrument(null)
      setUnits('')
      setQuery('')
      setRowError(null)
    },
    onError: (err) =>
      setRowError(err instanceof ApiError ? err.message : 'Could not record this purchase'),
  })

  const complete = useMutation({
    mutationFn: () => completeCategory(planId, item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] })
      setRowError(null)
    },
    onError: (err) =>
      setRowError(err instanceof ApiError ? err.message : 'Could not mark this category complete'),
  })

  async function onSearch(value: string) {
    setQuery(value)
    try {
      setResults(value.trim() ? await searchInstruments(value) : [])
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : 'Search failed')
    }
  }

  return (
    <Card className="space-y-2 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-900">{item.categoryName}</span>
        <span className="text-sm font-semibold text-brand-700">{formatInr(item.recommendedAmount)}</span>
      </div>

      {rowError && <div className="text-xs text-red-600">{rowError}</div>}

      {item.completed ? (
        <div className="text-xs font-medium text-emerald-600">Marked complete</div>
      ) : readOnly ? (
        <div className="text-xs text-stone-400">Not recorded</div>
      ) : open ? (
        <div className="space-y-2">
          {!instrument ? (
            <>
              <TextInput placeholder="Search instrument…" value={query} onChange={(e) => onSearch(e.target.value)} />
              <div className="space-y-1">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="w-full rounded-md border border-stone-200 p-2 text-left text-xs hover:border-brand-400"
                    onClick={() => setInstrument(r)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-stone-500">{instrument.name}</div>
              <TextInput
                type="number"
                placeholder="Units purchased"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
              <div className="flex gap-2">
                <Button disabled={!units || record.isPending} onClick={() => record.mutate()}>
                  Record purchase
                </Button>
                <Button variant="secondary" className="!w-auto shrink-0" onClick={() => setInstrument(null)}>
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Record a purchase
          </Button>
          <Button variant="secondary" className="!w-auto shrink-0" onClick={() => complete.mutate()}>
            Mark complete
          </Button>
        </div>
      )}
    </Card>
  )
}

/** Screen 6 — Active Investment Plan / Record Units. */
export function PlanActivePage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const {
    data: plan,
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => getPlan(planId!),
    enabled: !!planId,
  })

  const complete = useMutation({
    mutationFn: () => completePlan(planId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      navigate('/plans')
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not complete the plan'),
  })

  const cancel = useMutation({
    mutationFn: () => cancelPlan(planId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      navigate('/plans')
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not cancel the plan'),
  })

  if (isLoading) return <Page title="Investment plan" onBack={() => navigate("/plans")}>Loading…</Page>

  if (isError || !plan) {
    return (
      <Page title="Investment plan" onBack={() => navigate("/plans")}>
        <ErrorBanner
          message={
            loadError instanceof ApiError
              ? loadError.message
              : "Couldn't load this plan. Check your connection and try again."
          }
        />
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </Page>
    )
  }

  return (
    <Page title="Investment plan" onBack={() => navigate("/plans")}>
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <Card className="mb-4">
        <div className="text-sm text-stone-500">Contribution</div>
        <div className="font-serif text-2xl text-stone-900">{formatInr(plan.contribution)}</div>
        <div className="mt-1 text-xs text-stone-400">Status: {plan.status.replace('_', ' ')}</div>
      </Card>

      <div className="space-y-2">
        {plan.investing.map((item) => (
          <RecordPurchaseRow
            key={item.id}
            planId={plan.id}
            item={item}
            readOnly={plan.status === 'COMPLETED' || plan.status === 'CANCELLED'}
          />
        ))}
      </div>

      {plan.status !== 'COMPLETED' && plan.status !== 'CANCELLED' && (
        <div className="mt-6 space-y-2">
          <Button disabled={complete.isPending} onClick={() => complete.mutate()}>
            I'm finished with this plan
          </Button>
          <Button variant="danger" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
            Cancel remaining plan
          </Button>
        </div>
      )}
    </Page>
  )
}
