import { randomUUID } from "node:crypto"
import { Router } from "express"
import pool from "../db"
import { MAX_PROJECTS_PER_SESSION, sessionIdOf } from "../demo"
import { HttpError } from "../errors"
import { toProject } from "../mappers"
import { buildSet } from "../sql"
import { isUuid, parseProjectCreate, parseProjectUpdate } from "../validation"

const COLUMNS =
  "id, client_id, title, status, progress, progress_before_completed, deadline"
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

// A project may only point to a client from the same sandbox. The foreign key
// alone would accept any existing client, including another visitor's one.
async function requireOwnClient(
  clientId: string,
  sessionId: string
): Promise<void> {
  const result = await pool.query(
    "SELECT 1 FROM clients WHERE id = $1 AND session_id = $2",
    [clientId, sessionId]
  )
  if (result.rows.length === 0) throw new HttpError(400, "Client not found")
}

// Every query is scoped to the visitor's sandbox (session_id).
export const projectsRouter = Router()

projectsRouter.get("/", async (_request, response) => {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM projects WHERE session_id = $1 ORDER BY deadline, title`,
    [sessionIdOf(response)]
  )
  response.json(result.rows.map(toProject))
})

projectsRouter.post("/", async (request, response) => {
  const input = parseProjectCreate(request.body)
  const sessionId = sessionIdOf(response)
  await requireOwnClient(input.clientId, sessionId)
  // The INSERT only happens while the sandbox is below its limit.
  const result = await pool.query(
    `INSERT INTO projects (id, session_id, client_id, title, status, progress, progress_before_completed, deadline)
     SELECT $1, $2, $3, $4, $5, $6, $7, $8
     WHERE (SELECT count(*) FROM projects WHERE session_id = $2) < $9
     RETURNING ${COLUMNS}`,
    [
      randomUUID(),
      sessionId,
      input.clientId,
      input.title,
      input.status,
      input.progress,
      input.progressBeforeCompleted ?? null,
      input.deadline,
      MAX_PROJECTS_PER_SESSION,
    ]
  )
  if (result.rows.length === 0) throw new HttpError(409, "Demo limit reached")
  response.status(201).json(toProject(result.rows[0]))
})

projectsRouter.patch("/:id", async (request, response) => {
  const id = requireProjectId(request.params.id)
  const sessionId = sessionIdOf(response)
  const updates = parseProjectUpdate(request.body)
  if (updates.clientId !== undefined)
    await requireOwnClient(updates.clientId, sessionId)
  const { assignments, values } = buildSet(updates, UPDATABLE)
  const result = await pool.query(
    `UPDATE projects SET ${assignments}
     WHERE id = $${values.length + 1} AND session_id = $${values.length + 2}
     RETURNING ${COLUMNS}`,
    [...values, id, sessionId]
  )
  if (result.rows.length === 0) throw new HttpError(404, "Project not found")
  response.json(toProject(result.rows[0]))
})

projectsRouter.delete("/:id", async (request, response) => {
  const id = requireProjectId(request.params.id)
  const result = await pool.query(
    "DELETE FROM projects WHERE id = $1 AND session_id = $2",
    [id, sessionIdOf(response)]
  )
  if (result.rowCount === 0) throw new HttpError(404, "Project not found")
  response.status(204).end()
})
