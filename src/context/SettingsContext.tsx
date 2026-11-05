import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { SettingsContextValue } from "../types/models"
import type { Settings } from "../types/models"

type SettingsProviderProps = {
  children: ReactNode
}

const defaultSettings: Settings = {
  workspaceName: "Orbit Studio",
  email: "hello@orbit.studio",
  currency: "EUR",
  projectUpdates: true,
  newClients: true,
  weeklyReport: false,
}
// All monetary values in the app are stored in EUR. Rates describe one EUR.
const currencyRates = { EUR: 1, USD: 1.08, GBP: 0.86 }
const SettingsContext = createContext<SettingsContextValue | null>(null)

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem("orbitSettings")
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState(loadSettings)
  useEffect(() => {
    localStorage.setItem("orbitSettings", JSON.stringify(settings))
  }, [settings])
  const value = useMemo(
    () => ({
      settings,
      updateSettings: (changes: Partial<Settings>) =>
        setSettings((current) => ({ ...current, ...changes })),
      formatCurrency: (amount: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: settings.currency,
          maximumFractionDigits: 0,
        }).format(
          amount * (currencyRates[settings.currency] ?? currencyRates.EUR)
        ),
    }),
    [settings]
  )
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context)
    throw new Error("useSettings must be used inside SettingsProvider")
  return context
}

export { defaultSettings }
