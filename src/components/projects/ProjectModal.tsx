import ProgressControl from "./ProgressControl"
import { useFocusTrap } from "../../hooks/useFocusTrap"
import type { Client, ProjectStatus } from "../../types/models"
import type { FormEvent } from "react"

export type ProjectForm = {
  clientId: string
  title: string
  status: ProjectStatus
  progress: number
  deadline: string
}

type ProjectModalProps = {
  clients: Client[]
  fields: ProjectForm
  onChange: (field: keyof ProjectForm, value: string | number) => void
  onProgressChange: (progress: number) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function ProjectModal({
  clients,
  fields,
  onChange,
  onProgressChange,
  onClose,
  onSubmit,
}: ProjectModalProps) {
  const modalRef = useFocusTrap(true)
  const { clientId, title, status, progress, deadline } = fields
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
        aria-labelledby="project-modal-title"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">New delivery</p>
            <h2 id="project-modal-title">Create project</h2>
            <p>Add a new project to your workspace.</p>
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
            Client
            <select
              autoFocus
              value={clientId}
              onChange={(event) => onChange("clientId", event.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
          </label>
          <label>
            Project title
            <input
              type="text"
              placeholder="Project title"
              value={title}
              onChange={(event) => onChange("title", event.target.value)}
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
                <option>In progress</option>
                <option>In review</option>
                <option>Completed</option>
              </select>
            </label>
            <label>
              Progress
              <ProgressControl
                className="modal-progress-control"
                value={status === "Completed" ? 100 : progress}
                onChange={onProgressChange}
              />
            </label>
          </div>
          <label>
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={(event) => onChange("deadline", event.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default ProjectModal
