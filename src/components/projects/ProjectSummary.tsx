type ProjectSummaryProps = {
  total: number
  inProgress: number
  completed: number
  overdue: number
}

function ProjectSummary({
  total,
  inProgress,
  completed,
  overdue,
}: ProjectSummaryProps) {
  return (
    <section className="project-summary" aria-label="Project summary">
      <div>
        <span>All projects</span>
        <strong>{total}</strong>
        <small>In your workspace</small>
      </div>
      <div>
        <span>In progress</span>
        <strong>{inProgress}</strong>
        <small>Currently moving</small>
      </div>
      <div>
        <span>Completed</span>
        <strong>{completed}</strong>
        <small>Successfully delivered</small>
      </div>
      <div className={overdue ? "summary-alert" : ""}>
        <span>Needs attention</span>
        <strong>{overdue}</strong>
        <small>Overdue projects</small>
      </div>
    </section>
  )
}
export default ProjectSummary
