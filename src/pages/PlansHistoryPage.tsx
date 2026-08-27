import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getPlanHistory } from '../api/plans'
import { ApiError, type PlanStatus } from '../api/types'
import { Button, Card, ErrorBanner, Page, Spinner, formatDate, formatInr } from '../components/ui'

const STATUS_LABEL: Record<PlanStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const STATUS_COLOR: Record<PlanStatus, string> = {
  NOT_STARTED: 'text-slate-500',
  IN_PROGRESS: 'text-brand-600',
  COMPLETED: 'text-emerald-600',
  CANCELLED: 'text-slate-400',
}

/** Screen 7 — Plans/History. Active plan first, then history. No search/filters in V1. */
export function PlansHistoryPage() {
  const { data: plans, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlanHistory,
  })

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <Page title="Investment plans">
        <ErrorBanner
          message={
            error instanceof ApiError
              ? error.message
              : "Couldn't load your plans. Check your connection and try again."
          }
        />
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </Page>
    )
  }

  return (
    <Page title="Investment plans">
      <div className="space-y-2">
        {(plans ?? []).map((plan) => (
          <Link key={plan.id} to={`/plans/${plan.id}`}>
            <Card className="flex items-center justify-between p-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{formatInr(plan.contribution)}</div>
                <div className="text-xs text-slate-400">{formatDate(plan.createdAt)}</div>
              </div>
              <span className={`text-xs font-medium ${STATUS_COLOR[plan.status]}`}>
                {STATUS_LABEL[plan.status]}
              </span>
            </Card>
          </Link>
        ))}
        {(plans ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No plans yet.</p>
        )}
      </div>
    </Page>
  )
}
