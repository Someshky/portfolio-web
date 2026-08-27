import { currentIdToken } from '../auth/AuthContext'
import { ApiError } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

/**
 * Thin fetch wrapper: injects the base URL and the current Firebase ID token
 * as a bearer token, and turns RFC 7807 problem-detail error bodies into a
 * typed {@link ApiError} clients can branch on by `code` (never by message —
 * spec §18 keeps user-facing wording in this app, not the server).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await currentIdToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    let detail = response.statusText
    let code: string | undefined
    try {
      const problem = await response.json()
      detail = problem.detail ?? detail
      code = problem.code
    } catch {
      // Non-JSON error body — fall back to statusText.
    }
    throw new ApiError(detail, response.status, code)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}
