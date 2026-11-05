export function parseDeadline(deadline: string): Date | null {
  if (!deadline) return null
  const date = new Date(`${deadline}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDeadline(deadline: string): string {
  const date = parseDeadline(deadline)
  if (!date) return "No deadline"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date)
}

type DeadlineMeta = {
  label: string
  overdue: boolean
}

export function getDeadlineMeta(
  deadline: string,
  today: Date = new Date()
): DeadlineMeta {
  const date = parseDeadline(deadline)
  if (!date) return { label: "No deadline", overdue: false }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.ceil((date.getTime() - start.getTime()) / 86400000)
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, overdue: true }
  if (days === 0) return { label: "Due today", overdue: false }
  if (days === 1) return { label: "Due tomorrow", overdue: false }
  return { label: `Due in ${days}d`, overdue: false }
}

export function normalizeDeadline(deadline: string): string {
  if (!deadline || /^\d{4}-\d{2}-\d{2}$/.test(deadline)) return deadline
  const date = new Date(`${deadline}, 2026`)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
