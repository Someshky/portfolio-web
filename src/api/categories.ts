import { apiFetch } from './client'
import type { CategoryResponse, TargetAllocationEntry } from './types'

export function getCategories() {
  return apiFetch<CategoryResponse[]>('/api/v1/categories')
}

/** The whole set moves at once — targets must total exactly 100%. */
export function putCategories(categories: TargetAllocationEntry[]) {
  return apiFetch<CategoryResponse[]>('/api/v1/categories', {
    method: 'PUT',
    body: { categories },
  })
}

export function deleteCategory(id: string) {
  return apiFetch<void>(`/api/v1/categories/${id}`, { method: 'DELETE' })
}
