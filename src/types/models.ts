export type ClientStatus = "Active" | "Lead"
export type ProjectStatus = "In progress" | "In review" | "Completed"
export type ActivityType = "project" | "client"
export type Currency = "EUR" | "USD" | "GBP"

export type Client = {
  id: string
  name: string
  email: string
  company: string
  status: ClientStatus
  value: number
}

export type Project = {
  id: string
  clientId: string
  title: string
  progress: number
  status: ProjectStatus
  deadline: string
  progressBeforeCompleted?: number
}

export type Activity = {
  id: string
  type: ActivityType
  title: string
  detail: string
  createdAt: string
  clientId?: string
  projectId?: string
}

export type Settings = {
  workspaceName: string
  email: string
  currency: Currency
  projectUpdates: boolean
  newClients: boolean
  weeklyReport: boolean
}

export type SettingsContextValue = {
  formatCurrency: (amount: number) => string
  updateSettings: (object: Partial<Settings>) => void
  settings: Settings
}
