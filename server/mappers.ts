import type { Client, ClientStatus, Project, ProjectStatus } from "../src/types/models"

type Row = Record<string, unknown>

export function toClient(row: Row): Client {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: String(row.company),
    status: row.status as ClientStatus,
    value: Number(row.value),
  }
}

export function toProject(row: Row): Project {
  const project: Project = {
    id: String(row.id),
    clientId: String(row.client_id),
    title: String(row.title),
    status: row.status as ProjectStatus,
    progress: Number(row.progress),
    deadline: String(row.deadline),
  }
  if (row.progress_before_completed !== null && row.progress_before_completed !== undefined) {
    project.progressBeforeCompleted = Number(row.progress_before_completed)
  }
  return project
}
