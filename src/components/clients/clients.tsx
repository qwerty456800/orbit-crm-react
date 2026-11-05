import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import ClientSummary from "./ClientSummary"
import ClientsModal from "./ClientsModal"
import ClientsTable from "./ClientsTable"
import type { Client } from "../../types/models"
import type { ActivityType } from "../../types/models"
import type { ClientForm } from "./ClientsModal"
import { createClient } from "../../api/clientsApi"
import { updateClient as updateClientRequest } from "../../api/clientsApi"
import { deleteClient as deleteClientRequest } from "../../api/clientsApi"

type ClientProps = {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (id: string, changes: Partial<Client>) => void
  deleteClient: (id: string) => void
  addActivity: (type: ActivityType, title: string, detail: string) => void
  isLoading: boolean
  error: string|null
}

const emptyForm: ClientForm = {
  name: "",
  email: "",
  company: "",
  status: "Lead",
  value: "",
}

function Clients({
  clients,
  addClient,
  updateClient,
  deleteClient,
  addActivity,
  isLoading ,
  error
}: ClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("name")
  const [form, setForm] = useState(emptyForm)
  const normalizedSearch = search.trim().toLowerCase()
  const visibleClients = clients
    .filter(
      (client) => statusFilter === "All" || client.status === statusFilter
    )
    .filter((client) =>
      [client.name, client.email, client.company].some((field) =>
        field.toLowerCase().includes(normalizedSearch)
      )
    )
    .sort((first, second) => {
      if (sortBy === "value") return second.value - first.value
      if (sortBy === "status") return first.status.localeCompare(second.status)
      return first.name.localeCompare(second.name)
    })
  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length
  const totalValue = clients.reduce((sum, client) => sum + client.value, 0)

  useEffect(() => {
    if (!isModalOpen) return undefined
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isModalOpen])

  function closeModal() {
    setIsModalOpen(false)
    setEditingClientId(null)
    setForm(emptyForm)
  }
  function openCreateModal() {
    setEditingClientId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }
  function openEditModal(client: Client) {
    setEditingClientId(client.id)
    setForm({
      name: client.name,
      email: client.email,
      company: client.company,
      status: client.status,
      value: String(client.value),
    })
    setIsModalOpen(true)
  }
  function updateForm(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }
  async function handleDelete(id: string) {
   
  const deletedClient = clients.find((client) => client.id === id)

  await deleteClientRequest(id)

  deleteClient(id)

  if (deletedClient) {
    addActivity("client", "Client deleted", deletedClient.name)
}
  } 
  async function handleStatusChange(id: string) {
  const selectedClient = clients.find((client) => client.id === id)

  if (!selectedClient) {
    throw new Error("Client not found")
  }

  const nextStatus = selectedClient.status === "Active" ? "Lead" : "Active"

  const updatedClient = await updateClientRequest(id, {
    status: nextStatus,
  })

  updateClient(updatedClient.id, updatedClient)

  addActivity(
    "client",
    "Client status changed",
    `${updatedClient.name} · ${updatedClient.status}`
  )
}
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clientData = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      status: form.status,
      value: Number(form.value),
    }
    if (editingClientId !== null) {
  const updatedClient = await updateClientRequest(
    editingClientId,
    clientData
  )

  updateClient(updatedClient.id, updatedClient)

  addActivity(
    "client",
    "Client updated",
    `${updatedClient.name} · ${updatedClient.company}`
  )
} else {
        const createdClient = await createClient(clientData)

         addClient(createdClient)

         addActivity(
         "client",
         "New client added",
          `${createdClient.name} · ${createdClient.company}`
  )
}
    closeModal()
  }

  if(isLoading){
    return(
      <main className="clients-page">
        <p>Loading clients...</p>
      </main>
    )
  }
  if(error){
    return(
      <main className="clients-page">
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="clients-page">
      <div className="page-heading clients-heading">
        <div>
          <p className="eyebrow">Relationships</p>
          <h1>Clients</h1>
          <p>Manage every client relationship in one place.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={openCreateModal}
        >
          <span>＋</span> Add client
        </button>
      </div>
      <ClientSummary
        total={clients.length}
        active={activeClients}
        value={totalValue}
      />
      <section className="clients-panel">
        <div className="clients-toolbar">
          <div className="clients-toolbar-title">
            <h2>Client directory</h2>
            <p>
              {visibleClients.length} of {clients.length} clients
            </p>
          </div>
          <div className="clients-toolbar-controls">
            <label className="client-search">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clients..."
              />
            </label>
            <label className="client-sort">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="status">Status</option>
              </select>
            </label>
          </div>
        </div>
        <div className="client-filters" aria-label="Filter clients by status">
          {["All", "Active", "Lead"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={statusFilter === filter ? "active" : ""}
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
              <span>
                {filter === "All"
                  ? clients.length
                  : clients.filter((client) => client.status === filter).length}
              </span>
            </button>
          ))}
        </div>
        <div className="clients-table-wrapper">
          <ClientsTable
            clients={visibleClients}
            totalClients={clients.length}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
          />
        </div>
      </section>
      {isModalOpen && (
        <ClientsModal
          editing={editingClientId !== null}
          fields={form}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  )
}

export default Clients
