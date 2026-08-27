import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../api/categories'
import { addHolding } from '../api/holdings'
import { adoptInstrument, searchInstruments, searchProviderInstruments } from '../api/instruments'
import { ApiError, type InstrumentResponse, type ProviderInstrumentResponse } from '../api/types'
import { Button, Card, ErrorBanner, Page, TextInput } from '../components/ui'

/** Screen 3 — Add Existing Investments. One search box for name, ticker or ISIN. */
export function AddHoldingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState<InstrumentResponse | ProviderInstrumentResponse | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [units, setUnits] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: localResults } = useQuery({
    queryKey: ['instruments', 'local', debounced],
    queryFn: () => searchInstruments(debounced),
    enabled: debounced.length > 0,
  })
  const { data: providerResults } = useQuery({
    queryKey: ['instruments', 'provider', debounced],
    queryFn: () => searchProviderInstruments(debounced),
    enabled: debounced.length > 0,
  })

  function isProviderOnly(
    candidate: InstrumentResponse | ProviderInstrumentResponse,
  ): candidate is ProviderInstrumentResponse {
    return !('id' in candidate)
  }

  /**
   * AMFI's scheme name doesn't always spell out Direct/Regular or
   * Growth/IDCW — pull it out of the name when present, and fall back to the
   * scheme code so two identically-named results are still tellable apart.
   */
  function planLabel(candidate: ProviderInstrumentResponse): string {
    const match = candidate.name.match(/\b(direct|regular)\s*(plan)?\b.*?\b(growth|idcw|dividend|bonus)\b/i)
    if (match) {
      return `${match[1]} · ${match[3]}`.replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return `Scheme ${candidate.providerSymbol}`
  }

  const add = useMutation({
    mutationFn: async () => {
      if (!selected || !categoryId || !units) throw new Error('Pick an instrument, category and units')
      let instrumentId: string
      if (isProviderOnly(selected)) {
        const adopted = await adoptInstrument(selected)
        instrumentId = adopted.id
      } else {
        instrumentId = selected.id
      }
      return addHolding(instrumentId, categoryId, Number(units))
    },
    onSuccess: (holding) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      setJustAdded(holding.instrument.name)
      setSelected(null)
      setQuery('')
      setCategoryId('')
      setUnits('')
      setError(null)
    },
    onError: (err) => {
      setJustAdded(null)
      setError(err instanceof ApiError ? err.message : 'Could not add holding')
    },
  })

  return (
    <Page title="Add your existing investments">
      <p className="mb-4 text-sm text-slate-500">
        Search by fund/ETF/stock name, ticker, or ISIN.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {justAdded && !selected && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Added {justAdded} to your portfolio.
        </div>
      )}

      {!selected && (
        <>
          <TextInput
            placeholder="Search instruments…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setJustAdded(null)
            }}
          />

          <div className="mt-3 space-y-1.5">
            {(localResults ?? []).map((r) => (
              <button
                key={r.id}
                type="button"
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:border-brand-400"
                onClick={() => setSelected(r)}
              >
                <div className="font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">
                  {r.ticker ?? r.isin ?? r.exchange ?? ''}
                </div>
              </button>
            ))}
            {(providerResults ?? []).map((r) => (
              <button
                key={r.providerSymbol}
                type="button"
                className="w-full rounded-lg border border-dashed border-slate-300 bg-white p-3 text-left text-sm hover:border-brand-400"
                onClick={() => setSelected(r)}
              >
                <div className="font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">
                  Not in your list yet · {r.exchange ?? r.type} · {planLabel(r)}
                </div>
              </button>
            ))}
            {debounced && !localResults?.length && !providerResults?.length && (
              <p className="py-4 text-center text-sm text-slate-400">No matches yet</p>
            )}
          </div>
        </>
      )}

      {selected && (
        <Card className="space-y-3">
          <div>
            <div className="font-medium text-slate-900">{selected.name}</div>
            {isProviderOnly(selected) && (
              <div className="text-xs text-slate-500">{planLabel(selected)}</div>
            )}
            <button type="button" className="text-xs text-brand-600 underline" onClick={() => setSelected(null)}>
              Choose a different instrument
            </button>
          </div>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Choose a category…</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <TextInput
            type="number"
            placeholder="Units"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />

          <Button disabled={add.isPending} onClick={() => add.mutate()}>
            {add.isPending ? 'Adding…' : 'Add to portfolio'}
          </Button>
        </Card>
      )}

      <div className="mt-8">
        <Button variant="secondary" onClick={() => navigate('/')}>
          {add.isSuccess ? 'Done for now' : 'Skip — start with an empty portfolio'}
        </Button>
      </div>
    </Page>
  )
}
