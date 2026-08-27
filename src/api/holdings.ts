import { apiFetch } from './client'
import type { HoldingResponse } from './types'

export function addHolding(instrumentId: string, categoryId: string, units: number) {
  return apiFetch<HoldingResponse>('/api/v1/holdings', {
    method: 'POST',
    body: { instrumentId, categoryId, units },
  })
}

/** Zero units removes the holding (§11) — the server returns 204 in that case. */
export function updateHoldingUnits(holdingId: string, units: number) {
  return apiFetch<HoldingResponse | undefined>(`/api/v1/holdings/${holdingId}/units`, {
    method: 'PATCH',
    body: { units },
  })
}

export function moveHoldingCategory(holdingId: string, categoryId: string) {
  return apiFetch<HoldingResponse>(`/api/v1/holdings/${holdingId}/category`, {
    method: 'PATCH',
    body: { categoryId },
  })
}

export function removeHolding(holdingId: string) {
  return apiFetch<void>(`/api/v1/holdings/${holdingId}`, { method: 'DELETE' })
}
