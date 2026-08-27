import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function formatInr(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Spec: current allocation percentages match the sheet to one decimal place. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'never'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function Page({
  title,
  children,
  onBack,
}: {
  title: string
  children: ReactNode
  /** Pass a handler (e.g. `() => navigate(-1)`) to show a "← Back" control above the title. */
  onBack?: () => void
}) {
  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
      )}
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{title}</h1>
      {children}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const base = 'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50'
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${props.className ?? 'w-full'}`}
    />
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>
  )
}
