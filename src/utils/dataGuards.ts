import type { Client } from "../types/models"
import type { Project } from "../types/models"

export function isClient(value: unknown): value is Client {
  if (typeof value !== "object" || value === null) return false

  const client = value as Record<string, unknown>

  return (
    typeof client.id === "string" &&
    typeof client.name === "string" &&
    typeof client.email === "string" &&
    typeof client.company === "string" &&
    (client.status === "Active" || client.status === "Lead") &&
    typeof client.value === "number"
  )
}
export function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false

  const project = value as Record<string , unknown>

  return(
    typeof project.id === "string" &&
    typeof project.clientId === "string" &&
    typeof project.title === "string" &&
    (project.status === "In progress" || project.status === "In review" || project.status === "Completed") &&
    typeof project.deadline === "string" &&
    typeof project.progress === "number"
  )
}