import { apiFetch } from './client'
import type { InstrumentResponse, ProviderInstrumentResponse } from './types'

export function searchInstruments(query: string) {
  if (!query.trim()) return Promise.resolve<InstrumentResponse[]>([])
  return apiFetch<InstrumentResponse[]>(`/api/v1/instruments?q=${encodeURIComponent(query)}`)
}

export function searchProviderInstruments(query: string) {
  if (!query.trim()) return Promise.resolve<ProviderInstrumentResponse[]>([])
  return apiFetch<ProviderInstrumentResponse[]>(
    `/api/v1/instruments/provider-search?q=${encodeURIComponent(query)}`,
  )
}

export function adoptInstrument(candidate: ProviderInstrumentResponse) {
  return apiFetch<InstrumentResponse>('/api/v1/instruments/adopt', {
    method: 'POST',
    body: candidate,
  })
}
