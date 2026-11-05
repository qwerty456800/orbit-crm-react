import { Link } from "react-router-dom"
import StatCard from "./statcard"
import { formatDeadline, parseDeadline } from "./projects/dateUtils"
import { useSettings } from "../context/SettingsContext"
import type { Client, Project, Activity } from "../types/models"

type DashboardProps = {
  clients: Client[]
  projects: Project[]
  activity: Activity[]
}

const projectStatuses = [
  { name: "In progress", className: "progress", color: "#7557df" },
  { name: "In review", className: "review", color: "#e6a54b" },
  { name: "Completed", className: "completed", color: "#55b992" },
]

function formatActivityTime(createdAt: string) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  )
  if (elapsedMinutes < 1) return "Just now"
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours}h ago`
  return `${Math.floor(elapsedHours / 24)}d ago`
}

function Dashboard({ clients, projects, activity }: DashboardProps) {
  const { formatCurrency } = useSettings()
  const totalValue = clients.reduce((sum, client) => sum + client.value, 0)
  const averageValue = clients.length
    ? Math.round(totalValue / clients.length)
    : 0
  const activeProjects = projects.filter(
    (project) => project.status === "In progress"
  ).length
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length
  const topClient = [...clients].sort((a, b) => b.value - a.value)[0]
  const projectData = projectStatuses.map((status) => ({
    ...status,
    count: projects.filter((project) => project.status === status.name).length,
  }))
  const progressAngle = projects.length
    ? (projectData[0].count / projects.length) * 360
    : 0
  const reviewAngle = projects.length
    ? progressAngle + (projectData[1].count / projects.length) * 360
    : 0
  const upcomingDeadlines = projects
    .filter((project) => project.status !== "Completed")
    .map((project) => ({
      ...project,
      deadlineDate: parseDeadline(project.deadline),
    }))
    .filter((project) => project.deadlineDate !== null)
    .sort(
      (a, b) =>
        (a.deadlineDate?.getTime() ?? Infinity) -
        (b.deadlineDate?.getTime() ?? Infinity)
    )
    .slice(0, 4)

  return (
    <main className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good morning, Alex</h1>
          <p>Here is what is happening in your workspace.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total clients"
          value={clients.length}
          icon="♙"
          trend="Live"
          description="Clients in your workspace"
        />
        <StatCard
          title="Active projects"
          value={activeProjects}
          icon="◇"
          trend="Live"
          description="Currently in progress"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(totalValue)}
          icon={formatCurrency(0).replace(/[0-9.,\s]/g, "")}
          trend="Live"
          description="Total client value"
        />
        <StatCard
          title="Completed projects"
          value={completedProjects}
          icon="✓"
          trend="Live"
          description="Successfully delivered"
        />
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel project-overview-panel">
          <div className="dashboard-panel-head">
            <div>
              <h2>Project overview</h2>
              <p>Current workload distribution</p>
            </div>
            <Link to="/projects">View all</Link>
          </div>
          <div className="project-overview-content">
            <div
              className="project-donut"
              style={{
                background: `conic-gradient(#7557df 0deg ${progressAngle}deg, #e6a54b ${progressAngle}deg ${reviewAngle}deg, #55b992 ${reviewAngle}deg 360deg)`,
              }}
            >
              <div>
                <strong>{projects.length}</strong>
                <span>Projects</span>
              </div>
            </div>
            <div className="project-legend">
              {projectData.map((item) => (
                <div key={item.name}>
                  <i style={{ background: item.color }} />
                  <p>
                    <span>{item.name}</span>
                    <small>{item.count} projects</small>
                  </p>
                  <strong>
                    {projects.length
                      ? Math.round((item.count / projects.length) * 100)
                      : 0}
                    %
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-panel deadlines-panel">
          <div className="dashboard-panel-head">
            <div>
              <h2>Upcoming deadlines</h2>
              <p>Projects requiring attention</p>
            </div>
            <Link to="/projects">View all</Link>
          </div>
          <div className="deadline-list">
            {!upcomingDeadlines.length && (
              <p className="dashboard-empty">No upcoming deadlines.</p>
            )}
            {upcomingDeadlines.map((project) => (
              <div key={project.id}>
                <span className="deadline-date">
                  {formatDeadline(project.deadline)}
                </span>
                <p>
                  <strong>{project.title}</strong>
                  <small>
                    {clients.find((client) => client.id === project.clientId)
                      ?.company ?? "Unassigned client"}
                  </small>
                </p>
                <span
                  className={`project-status ${project.status === "In review" ? "status-review" : "status-progress"}`}
                >
                  {project.progress}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel activity-panel">
          <div className="dashboard-panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Latest workspace updates</p>
            </div>
          </div>
          <div className="activity-list">
            {!activity.length && (
              <p className="dashboard-empty">
                New client and project actions will appear here.
              </p>
            )}
            {activity.slice(0, 5).map((item) => (
              <div key={item.id}>
                <span className={`activity-symbol ${item.type}`}>
                  {item.type === "client" ? "♙" : "◇"}
                </span>
                <p>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </p>
                <time>{formatActivityTime(item.createdAt)}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel finance-panel">
          <div className="dashboard-panel-head">
            <div>
              <h2>Financial snapshot</h2>
              <p>Value across your client portfolio</p>
            </div>
            <Link to="/reports">Open reports</Link>
          </div>
          <div className="finance-total">
            <span>Total client value</span>
            <strong>{formatCurrency(totalValue)}</strong>
            <small>Based on {clients.length} clients</small>
          </div>
          <div className="finance-metrics">
            <div>
              <span>Average value</span>
              <strong>{formatCurrency(averageValue)}</strong>
            </div>
            <div>
              <span>Top client</span>
              <strong>{topClient?.name ?? "No data"}</strong>
              <small>
                {topClient ? formatCurrency(topClient.value) : "Add a client"}
              </small>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard
