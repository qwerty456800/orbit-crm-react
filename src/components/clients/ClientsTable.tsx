import ClientRow from "./ClientRow"
import type { Client } from "../../types/models"

type ClientsTableProps = {
  clients: Client[]
  totalClients: number
  onDelete: (id: string) => void
  onStatusChange: (id: string) => void
  onEdit: (client: Client) => void
}

function ClientsTable({
  clients,
  totalClients,
  onDelete,
  onStatusChange,
  onEdit,
}: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <span>♙</span>
        <h2>{totalClients ? "No matching clients" : "No clients yet"}</h2>
        <p>
          {totalClients
            ? "Try a different search."
            : "Add your first client to get started."}
        </p>
      </div>
    )
  }

  return (
    <table className="clients-table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Company</th>
          <th>Status</th>
          <th>Value</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            onDelete={() => onDelete(client.id)}
            onStatusChange={() => onStatusChange(client.id)}
            onEdit={() => onEdit(client)}
          />
        ))}
      </tbody>
    </table>
  )
}

export default ClientsTable
