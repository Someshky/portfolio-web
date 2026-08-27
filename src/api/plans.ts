import { currentIdToken } from '../auth/AuthContext'
import { apiFetch } from './client'
import type { PlanResponse, PlanSummary, PurchaseResponse } from './types'

export function calculatePlan(amount: number) {
  return apiFetch<PlanResponse>('/api/v1/plans/calculate', {
    method: 'POST',
    body: { amount },
  })
}

export function recalculatePlan(planId: string, amount?: number) {
  return apiFetch<PlanResponse>(`/api/v1/plans/${planId}/recalculate`, {
    method: 'POST',
    body: amount !== undefined ? { amount } : undefined,
  })
}

export function getPlanHistory() {
  return apiFetch<PlanSummary[]>('/api/v1/plans')
}

/** 204 (no content) when there's no active plan. */
export async function getActivePlan(): Promise<PlanResponse | null> {
  const token = await currentIdToken()
  const base = import.meta.env.VITE_API_BASE_URL
  const response = await fetch(`${base}/api/v1/plans/active`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (response.status === 204) return null
  if (!response.ok) throw new Error('Failed to load active plan')
  return response.json()
}

export function getPlan(planId: string) {
  return apiFetch<PlanResponse>(`/api/v1/plans/${planId}`)
}

export function recordPurchase(planId: string, planItemId: string, instrumentId: string, units: number) {
  return apiFetch<PurchaseResponse>(`/api/v1/plans/${planId}/purchases`, {
    method: 'POST',
    body: { planItemId, instrumentId, units },
  })
}

export function completeCategory(planId: string, itemId: string) {
  return apiFetch(`/api/v1/plans/${planId}/items/${itemId}/complete`, { method: 'POST' })
}

export function completePlan(planId: string) {
  return apiFetch<PlanResponse>(`/api/v1/plans/${planId}/complete`, { method: 'POST' })
}

export function cancelPlan(planId: string) {
  return apiFetch<PlanResponse>(`/api/v1/plans/${planId}/cancel`, { method: 'POST' })
}
