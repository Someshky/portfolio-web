import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'amounts-visible'

interface AmountVisibilityState {
  visible: boolean
  toggle: () => void
}

const AmountVisibilityContext = createContext<AmountVisibilityState>({
  visible: false,
  toggle: () => {},
})

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** Masked by default — amounts only show once the user explicitly reveals them. */
export function AmountVisibilityProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(visible))
    } catch {
      // Private browsing / storage blocked — visibility just won't persist.
    }
  }, [visible])

  return (
    <AmountVisibilityContext.Provider value={{ visible, toggle: () => setVisible((v) => !v) }}>
      {children}
    </AmountVisibilityContext.Provider>
  )
}

export function useAmountVisibility() {
  return useContext(AmountVisibilityContext)
}
