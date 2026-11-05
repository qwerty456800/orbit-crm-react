import { useState } from "react"
import ProgressControl from "./ProgressControl"
import { formatDeadline, getDeadlineMeta } from "./dateUtils"
import type { Project, Client } from "../../types/models"

type ProjectCardProps = {
  project: Project
  client: Client | undefined
  onDelete: () => void
  onStatusChange: () => void
  onProgressChange: (progress: number) => void
}

const colorClasses = {
  "In progress": "status-progress",
  "In review": "status-review",
  Completed: "status-completed",
}

function ProjectCard({
  project,
  client,
  onDelete,
  onStatusChange,
  onProgressChange,
}: ProjectCardProps) {
  const company = client?.company ?? "Unassigned client"
  const deadlineMeta = getDeadlineMeta(project.deadline)
  const initial = company.trim().charAt(0).toUpperCase() || "O"
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className="project-logo">{initial}</span>
        <span className={`project-status ${colorClasses[project.status]}`}>
          {project.status}
        </span>
      </div>
      <p className="project-company">{company}</p>
      <h2>{project.title}</h2>
      <div className="project-progress-copy">
        <span>Progress</span>
        <strong>{project.progress}%</strong>
      </div>
      <div
        className="project-progress"
        aria-label={`${project.progress}% complete`}
      >
        <span style={{ width: `${project.progress}%` }} />
      </div>
      {isProgressOpen && (
        <ProgressControl
          className="progress-editor"
          value={project.progress}
          onChange={onProgressChange}
        />
      )}
      <div className="project-card-footer">
        <time
          className={`project-deadline ${deadlineMeta.overdue ? "overdue" : ""}`}
          dateTime={project.deadline}
        >
          <span>{formatDeadline(project.deadline)}</span>
          <small>{deadlineMeta.label}</small>
        </time>
        <div className="project-actions">
          <button
            type="button"
            className="change-project-status"
            onClick={onStatusChange}
          >
            Change status
          </button>
          <button
            type="button"
            className={`edit-project-progress ${isProgressOpen ? "active" : ""}`}
            onClick={() => setIsProgressOpen((current) => !current)}
            aria-label="Adjust project progress"
            aria-expanded={isProgressOpen}
          >
            %
          </button>
          <button type="button" className="delete-project" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
export default ProjectCard
