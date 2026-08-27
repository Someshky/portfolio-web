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
    // HTTP/2 responses often have an empty statusText, and a gateway timeout
    // (e.g. Render's free tier waking from cold-start) returns an HTML page,
    // not our normal JSON error body — always fall back to something
    // non-blank rather than risk an empty error message.
    let detail = response.statusText || `Request failed (HTTP ${response.status})`
    let code: string | undefined
    try {
      const problem = await response.json()
      detail = problem.detail || detail
      code = problem.code
    } catch {
      // Non-JSON error body — keep the fallback above.
    }
    throw new ApiError(detail, response.status, code)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}
