import { useSettings } from "../../context/SettingsContext"
type ClientSummaryProps = {
  total: number
  active: number
  value: number
}

function ClientSummary({ total, active, value }: ClientSummaryProps) {
  const { formatCurrency } = useSettings()
  return (
    <section className="client-summary" aria-label="Client summary">
      <div>
        <span>All clients</span>
        <strong>{total}</strong>
        <small>In your workspace</small>
      </div>
      <div>
        <span>Active clients</span>
        <strong>{active}</strong>
        <small>Current relationships</small>
      </div>
      <div>
        <span>Total value</span>
        <strong>{formatCurrency(value)}</strong>
        <small>Combined client value</small>
      </div>
    </section>
  )
}

export default ClientSummary
