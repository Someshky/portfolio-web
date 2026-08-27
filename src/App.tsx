import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { BottomNav } from './components/BottomNav'
import { Spinner } from './components/ui'
import { AddHoldingsPage } from './pages/AddHoldingsPage'
import { LoginPage } from './pages/LoginPage'
import { MyInvestmentsPage } from './pages/MyInvestmentsPage'
import { PlanActivePage } from './pages/PlanActivePage'
import { PlanCalculatePage } from './pages/PlanCalculatePage'
import { PlansHistoryPage } from './pages/PlansHistoryPage'
import { PortfolioHomePage } from './pages/PortfolioHomePage'
import { SettingsPage } from './pages/SettingsPage'
import { TargetAllocationPage } from './pages/TargetAllocationPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <Spinner />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Shell>
              <PortfolioHomePage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/setup/categories"
        element={
          <RequireAuth>
            <TargetAllocationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/setup/holdings"
        element={
          <RequireAuth>
            <AddHoldingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/plans/new"
        element={
          <RequireAuth>
            <PlanCalculatePage />
          </RequireAuth>
        }
      />
      <Route
        path="/plans"
        element={
          <RequireAuth>
            <Shell>
              <PlansHistoryPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/plans/:planId"
        element={
          <RequireAuth>
            <PlanActivePage />
          </RequireAuth>
        }
      />
      <Route
        path="/holdings"
        element={
          <RequireAuth>
            <Shell>
              <MyInvestmentsPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Shell>
              <SettingsPage />
            </Shell>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
