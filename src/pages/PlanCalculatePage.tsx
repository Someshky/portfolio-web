import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculatePlan, recalculatePlan } from '../api/plans'
import { ApiError, type PlanResponse } from '../api/types'
import { Button, Card, ErrorBanner, Page, TextInput, formatInr } from '../components/ui'

/** Screen 5 — Investment Plan. The core value screen. */
export function PlanCalculatePage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculate = useMutation({
    mutationFn: () => calculatePlan(Number(amount)),
    onSuccess: setPlan,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not calculate a plan'),
  })

  const recalculate = useMutation({
    mutationFn: () => recalculatePlan(plan!.id, Number(amount)),
    onSuccess: setPlan,
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not recalculate'),
  })

  return (
    <Page title="Investment plan" onBack={() => navigate('/')}>
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!plan && (
        <Card className="space-y-3">
          <p className="text-sm text-slate-500">How much do you want to invest this time?</p>
          <TextInput
            type="number"
            placeholder="e.g. 10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button disabled={!amount || calculate.isPending} onClick={() => calculate.mutate()}>
            {calculate.isPending ? 'Calculating…' : 'Calculate'}
          </Button>
        </Card>
      )}

      {plan && (
        <>
          <Card className="mb-4">
            <div className="text-sm text-slate-500">Total contribution</div>
            <div className="text-2xl font-semibold text-slate-900">{formatInr(plan.contribution)}</div>
          </Card>

          <p className="mb-3 text-sm text-slate-600">
            We use your new investment to bring your portfolio closer to the targets you chose.
          </p>

          <div className="mb-2 text-sm font-medium text-slate-700">Invest this time</div>
          <div className="space-y-2">
            {plan.investing.map((item) => (
              <Card key={item.id} className="flex items-center justify-between p-3">
                <span className="text-sm font-medium text-slate-900">{item.categoryName}</span>
                <span className="text-sm font-semibold text-brand-700">
                  {formatInr(item.recommendedAmount)}
                </span>
              </Card>
            ))}
            {plan.investing.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                Nothing is below target right now.
              </p>
            )}
          </div>

          {plan.notInvesting.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-slate-500">
                Not investing this time ({plan.notInvesting.length})
              </summary>
              <div className="mt-2 space-y-2">
                {plan.notInvesting.map((item) => (
                  <Card key={item.id} className="flex items-center justify-between p-3">
                    <span className="text-sm text-slate-600">{item.categoryName}</span>
                    <span className="text-xs text-slate-400">already at or above target</span>
                  </Card>
                ))}
              </div>
            </details>
          )}

          <div className="mt-6 space-y-2">
            <Button onClick={() => navigate(`/plans/${plan.id}`)}>Start investing</Button>
            <div className="flex gap-2">
              <TextInput
                type="number"
                placeholder="New amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                className="!w-auto shrink-0"
                disabled={!amount || recalculate.isPending}
                onClick={() => recalculate.mutate()}
              >
                Recalculate
              </Button>
            </div>
          </div>
        </>
      )}
    </Page>
  )
}
