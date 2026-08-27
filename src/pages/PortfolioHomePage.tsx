import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPortfolioHome, refreshPrices } from '../api/portfolio'
import { ApiError } from '../api/types'
import { Button, Card, ErrorBanner, Page, Spinner, formatDate, formatInr, formatPercent } from '../components/ui'

/** Screen 4 — Portfolio Home. No daily P&L, news, or predictions (§6). */
export function PortfolioHomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolioHome,
  })
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)

  const refresh = useMutation({
    mutationFn: refreshPrices,
    onSuccess: (result) => {
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

  if (isError || !data) {
    return (
      <Page title="Your portfolio">
        <ErrorBanner
          message={
            error instanceof ApiError
              ? error.message
              : "Couldn't load your portfolio. Check your connection and try again."
          }
        />
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </Page>
    )
  }

  return (
    <Page title="Your portfolio">
      {refreshMessage && (
        <div className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {refreshMessage}
        </div>
      )}
      <Card className="mb-4">
        <div className="text-sm text-slate-500">Total value</div>
        <div className="text-2xl font-semibold text-slate-900">{formatInr(data.portfolioValueInr)}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <span>Prices as of {formatDate(data.pricesAsOf)}</span>
          <button
            type="button"
            className="text-brand-600 disabled:opacity-50"
            disabled={refresh.isPending}
            onClick={() => refresh.mutate()}
          >
            {refresh.isPending ? 'Refreshing…' : 'Refresh prices'}
          </button>
        </div>
        {data.unpricedHoldingCount > 0 && (
          <p className="mt-2 text-xs text-amber-600">
            {data.unpricedHoldingCount} holding(s) don't have a price yet.
          </p>
        )}
      </Card>

      {data.activePlan && (
        <Card className="mb-4 border-brand-200 bg-brand-50">
          <div className="text-sm font-medium text-brand-800">
            Investment plan in progress — {formatInr(data.activePlan.contribution)}
          </div>
          <Link to={`/plans/${data.activePlan.id}`}>
            <Button className="mt-2">Continue</Button>
          </Link>
        </Card>
      )}

      <div className="mb-2 text-sm font-medium text-slate-700">Current vs target</div>
      <div className="space-y-2">
        {data.allocation.map((row) => (
          <Card key={row.categoryId} className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{row.name}</span>
              <span className="text-slate-500">
                {formatPercent(row.currentPercent)} <span className="text-slate-300">/</span>{' '}
                {formatPercent(row.targetPercent)} target
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.min(100, row.currentPercent)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-slate-400">{formatInr(row.currentValueInr)}</div>
          </Card>
        ))}
        {data.allocation.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            No categories yet.{' '}
            <Link to="/setup/categories" className="text-brand-600 underline">
              Set your targets
            </Link>
          </p>
        )}
      </div>

      {!data.activePlan && (
        <div className="mt-6">
          <Button onClick={() => navigate('/plans/new')}>Enter an amount to invest</Button>
        </div>
      )}
    </Page>
  )
}
