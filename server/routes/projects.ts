import { randomUUID } from "node:crypto"
import { Router } from "express"
import pool from "../db"
import { HttpError } from "../errors"
import { toProject } from "../mappers"
import { buildSet } from "../sql"
import { isUuid, parseProjectCreate, parseProjectUpdate } from "../validation"

const COLUMNS = "id, client_id, title, status, progress, progress_before_completed, deadline"
const UPDATABLE = {
  clientId: "client_id",
  title: "title",
  status: "status",
  progress: "progress",
  progressBeforeCompleted: "progress_before_completed",
  deadline: "deadline",
}

function requireProjectId(id: string): string {
  if (!isUuid(id)) throw new HttpError(404, "Project not found")
  return id
}

export const projectsRouter = Router()

projectsRouter.get("/", async (_request, response) => {
  const result = await pool.query(`SELECT ${COLUMNS} FROM projects ORDER BY deadline, title`)
  response.json(result.rows.map(toProject))
})

// An unknown clientId violates the FK (23503); errorHandler maps it to 400 "Client not found".
projectsRouter.post("/", async (request, response) => {
  const input = parseProjectCreate(request.body)
  const result = await pool.query(
    `INSERT INTO projects (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNS}`,
    [
      randomUUID(),
      input.clientId,
      input.title,
      input.status,
      input.progress,
      input.progressBeforeCompleted ?? null,
      input.deadline,
    ]
  )
  response.status(201).json(toProject(result.rows[0]))
})

projectsRouter.patch("/:id", async (request, response) => {
  const id = requireProjectId(request.params.id)
  const { assignments, values } = buildSet(parseProjectUpdate(request.body), UPDATABLE)
  const result = await pool.query(
    `UPDATE projects SET ${assignments} WHERE id = $${values.length + 1} RETURNING ${COLUMNS}`,
    [...values, id]
  )
  if (result.rows.length === 0) throw new HttpError(404, "Project not found")
  response.json(toProject(result.rows[0]))
})

projectsRouter.delete("/:id", async (request, response) => {
  const id = requireProjectId(request.params.id)
  const result = await pool.query("DELETE FROM projects WHERE id = $1", [id])
  if (result.rowCount === 0) throw new HttpError(404, "Project not found")
  response.status(204).end()
})
