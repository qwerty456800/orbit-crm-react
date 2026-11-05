import type { Client } from "../../types/models"
import { useSettings } from "../../context/SettingsContext"

type ClientRowProps = {
  client: Client
  onDelete: () => void
  onStatusChange: () => void
  onEdit: () => void
}

function ClientRow({
  client,
  onDelete,
  onStatusChange,
  onEdit,
}: ClientRowProps) {
  const { formatCurrency } = useSettings()
  const initials = client.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <tr>
      <td>
        <div className="client-cell">
          <span className="client-avatar">{initials}</span>
          <div className="client-info">
            <strong>{client.name}</strong>
            <small>{client.email}</small>
          </div>
        </div>
      </td>
      <td>{client.company}</td>
      <td>
        <span
          className={`status ${client.status === "Active" ? "active-status" : "lead-status"}`}
        >
          {client.status}
        </span>
      </td>
      <td className="client-value">{formatCurrency(client.value)}</td>
      <td>
        <div className="client-actions">
          <button
            type="button"
            className="edit-client"
            onClick={onStatusChange}
          >
            Change status
          </button>
          <button
            type="button"
            className="edit-client-details"
            onClick={onEdit}
          >
            Edit
          </button>
          <button type="button" className="delete-client" onClick={onDelete}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default ClientRow
