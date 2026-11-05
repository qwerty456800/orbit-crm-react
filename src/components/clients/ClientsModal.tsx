import { useFocusTrap } from "../../hooks/useFocusTrap"
import type { ClientStatus } from "../../types/models"
import type { FormEvent } from "react"

export type ClientForm = {
  name: string
  email: string
  company: string
  status: ClientStatus
  value: string
}

type ClientModalProps = {
  editing: boolean
  fields: ClientForm
  onChange: (field: keyof ClientForm, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function ClientsModal({
  editing,
  fields,
  onChange,
  onClose,
  onSubmit,
}: ClientModalProps) {
  const modalRef = useFocusTrap(true)
  const { name, email, company, status, value } = fields
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="client-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              {editing ? "Client profile" : "New relationship"}
            </p>
            <h2 id="client-modal-title">
              {editing ? "Edit client" : "Add client"}
            </h2>
            <p>
              {editing
                ? "Update this client's details."
                : "Create a client profile for your workspace."}
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form className="modal-form" onSubmit={onSubmit}>
          <label>
            Client name
            <input
              autoFocus
              type="text"
              placeholder="Name and surname"
              value={name}
              onChange={(event) => onChange("name", event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="client@company.com"
              value={email}
              onChange={(event) => onChange("email", event.target.value)}
              required
            />
          </label>
          <label>
            Company
            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(event) => onChange("company", event.target.value)}
              required
            />
          </label>
          <div className="modal-form-row">
            <label>
              Status
              <select
                value={status}
                onChange={(event) => onChange("status", event.target.value)}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
              </select>
            </label>
            <label>
              Client value
              <input
                type="number"
                placeholder="12000"
                min="0"
                value={value}
                onChange={(event) => onChange("value", event.target.value)}
                required
              />
            </label>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editing ? "Save changes" : "Create client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientsModal
