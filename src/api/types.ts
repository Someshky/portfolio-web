export type Currency = 'INR' | 'USD'
export type InstrumentType = 'MUTUAL_FUND' | 'ETF' | 'STOCK' | 'OTHER'
export type PlanStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MeResponse {
  userId: string
  portfolioId: string
  email: string | null
}

export interface CategoryResponse {
  id: string
  name: string
  targetPercent: number
  createdAt: string
}

export interface TargetAllocationEntry {
  id: string | null
  name: string
  targetPercent: number
}

export interface InstrumentResponse {
  id: string
  name: string
  ticker: string | null
  isin: string | null
  exchange: string | null
  type: InstrumentType
  currency: Currency
}

export interface ProviderInstrumentResponse {
  providerSymbol: string
  name: string
  ticker: string | null
  isin: string | null
  exchange: string | null
  type: InstrumentType | null
  currency: Currency | null
}

export interface HoldingResponse {
  id: string
  instrument: InstrumentResponse
  categoryId: string
  categoryName: string
  units: number
  valueInr: number | null
  priceAsOf: string | null
  priced: boolean
}

export interface AllocationRow {
  categoryId: string
  name: string
  targetPercent: number
  currentPercent: number
  currentValueInr: number
}

export interface PlanSummary {
  id: string
  contribution: number
  status: PlanStatus
  requiresRecalculation: boolean
  createdAt: string
}

export interface PortfolioHomeResponse {
  portfolioId: string
  portfolioValueInr: number
  pricesAsOf: string | null
  allocation: AllocationRow[]
  activePlan: PlanSummary | null
  unpricedHoldingCount: number
}

export interface PlanItemResponse {
  id: string
  categoryId: string | null
  categoryName: string
  targetPercent: number
  currentPercent: number
  currentValueInr: number
  recommendedAmount: number
  eligible: boolean
  completed: boolean
}

export interface PlanResponse {
  id: string
  contribution: number
  status: PlanStatus
  requiresRecalculation: boolean
  portfolioValueInr: number
  pricesAsOf: string | null
  totalRecommended: number
  investing: PlanItemResponse[]
  notInvesting: PlanItemResponse[]
  createdAt: string
}

export interface PurchaseResponse {
  id: string
  planItemId: string
  instrumentId: string
  units: number
  recordedAt: string
}

export interface PriceRefreshResponse {
  updated: number
  failed: number
  refreshedAt: string
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}
