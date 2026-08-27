import { apiFetch } from './client'
import type { MeResponse } from './types'

export function getMe() {
  return apiFetch<MeResponse>('/api/v1/me')
}

export function deleteAccount() {
  return apiFetch<void>('/api/v1/account', { method: 'DELETE' })
}
