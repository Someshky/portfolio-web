import { apiFetch } from './client'
import type { HoldingResponse, PortfolioHomeResponse, PriceRefreshResponse } from './types'

export function getPortfolioHome() {
  return apiFetch<PortfolioHomeResponse>('/api/v1/portfolio')
}

export function getHoldings() {
  return apiFetch<HoldingResponse[]>('/api/v1/holdings')
}

export function refreshPrices() {
  return apiFetch<PriceRefreshResponse>('/api/v1/prices/refresh', { method: 'POST' })
}
