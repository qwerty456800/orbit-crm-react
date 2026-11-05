import { useState } from "react"
import StatCard from "./statcard"
import { useSettings } from "../context/SettingsContext"
import { formatDeadline } from "./projects/dateUtils"
import type { Client, Project } from "../types/models"

type ReportsProps = {
  clients: Client[]
  projects: Project[]
}

function Reports({ clients, projects }: ReportsProps) {
  const { formatCurrency } = useSettings()
  const [period, setPeriod] = useState("month")
  const revenue = clients.reduce((sum, client) => sum + client.value, 0)
  const completed = projects.filter(
    (project) => project.status === "Completed"
  ).length
  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length
  const averageValue = clients.length ? Math.round(revenue / clients.length) : 0
  const topClients = [...clients].sort((a, b) => b.value - a.value).slice(0, 5)
  const averageProgress = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.progress, 0) /
          projects.length
      )
    : 0
  const leadsValue = clients
    .filter((client) => client.status === "Lead")
    .reduce((sum, client) => sum + client.value, 0)
  const clientBreakdown = [...clients].sort((a, b) => b.value - a.value)
  const upcomingProjects = [...projects]
    .filter((project) => project.status !== "Completed" && project.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5)

  function exportCsv() {
    const rows = [
      ["Client", "Company", "Status", "Value"],
      ...clients.map((client) => [
        client.name,
        client.company,
        client.status,
        client.value,
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "orbit-crm-clients.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="reports-page">
      <div className="page-heading reports-heading">
        <div>
          <p className="eyebrow">Performance</p>
          <h1>Reports</h1>
          <p>A live overview based on your CRM data.</p>
        </div>
        <div className="reports-actions">
          <label>
            Period
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
              <option value="year">This year</option>
            </select>
          </label>
          <button
            type="button"
            className="secondary-button"
            onClick={exportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          title="Total revenue"
          value={formatCurrency(revenue)}
          icon={formatCurrency(0).replace(/[0-9.,\s]/g, "")}
          trend="Live"
          description="Combined client value"
        />
        <StatCard
          title="Average progress"
          value={`${averageProgress}%`}
          icon="↗"
          trend="Live"
          description="Across all projects"
        />
        <StatCard
          title="Lead pipeline"
          value={formatCurrency(leadsValue)}
          icon="◎"
          trend="Live"
          description="Potential client value"
        />
        <StatCard
          title="Completed projects"
          value={completed}
          icon="✓"
          trend="Live"
          description="Successfully delivered"
        />
        <StatCard
          title="Active clients"
          value={activeClients}
          icon="♙"
          trend="Live"
          description="Current relationships"
        />
        <StatCard
          title="Average client value"
          value={formatCurrency(averageValue)}
          icon="↗"
          trend="Live"
          description="Across all clients"
        />
      </div>
      <div className="reports-grid">
        <section className="report-panel">
          <div className="panel-heading">
            <div>
              <h2>Top clients</h2>
              <p>By client value</p>
            </div>
          </div>
          <div className="ranking">
            {!topClients.length && (
              <p className="empty-inline">No client data yet.</p>
            )}
            {topClients.map((client, index) => (
              <div key={client.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>
                  <strong>{client.name}</strong>
                  <small>{client.company}</small>
                </p>
                <b>{formatCurrency(client.value)}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="report-panel revenue-breakdown-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue breakdown</h2>
              <p>Client value distribution</p>
            </div>
          </div>
          <div className="revenue-breakdown">
            {clientBreakdown.slice(0, 5).map((client) => (
              <div key={client.id}>
                <div className="revenue-breakdown-copy">
                  <span>{client.company}</span>
                  <strong>{formatCurrency(client.value)}</strong>
                </div>
                <div className="revenue-track">
                  <span
                    style={{
                      width: `${revenue ? (client.value / revenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="report-panel deadline-outlook-panel">
          <div className="panel-heading">
            <div>
              <h2>Deadline outlook</h2>
              <p>Upcoming unfinished projects</p>
            </div>
          </div>
          <div className="deadline-outlook">
            {upcomingProjects.length ? (
              upcomingProjects.map((project) => (
                <div key={project.id}>
                  <span className="deadline-dot" />
                  <p>
                    <strong>{project.title}</strong>
                    <small>{formatDeadline(project.deadline)}</small>
                  </p>
                  <b>{project.progress}%</b>
                </div>
              ))
            ) : (
              <p className="empty-inline">No upcoming deadlines.</p>
            )}
          </div>
        </section>
      </div>
      <section className="report-panel report-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Client performance</h2>
            <p>Value, relationship status, and next deadline</p>
          </div>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Status</th>
                <th>Value</th>
                <th>Projects</th>
                <th>Progress</th>
                <th>Next deadline</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((client) => {
                const clientProjects = projects.filter(
                  (project) => project.clientId === client.id
                )
                const progress = clientProjects.length
                  ? Math.round(
                      clientProjects.reduce(
                        (sum, project) => sum + project.progress,
                        0
                      ) / clientProjects.length
                    )
                  : 0
                const nextDeadline = clientProjects
                  .filter((project) => project.deadline)
                  .sort((a, b) =>
                    a.deadline.localeCompare(b.deadline)
                  )[0]?.deadline
                return (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.name}</strong>
                      <small>{client.company}</small>
                    </td>
                    <td>
                      <span
                        className={`status ${client.status === "Active" ? "active-status" : "lead-status"}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td>{formatCurrency(client.value)}</td>
                    <td>{clientProjects.length}</td>
                    <td>{progress}%</td>
                    <td>{nextDeadline ? formatDeadline(nextDeadline) : "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default Reports
