import { randomUUID } from "node:crypto"
import { Router } from "express"
import pool from "../db"
import { MAX_CLIENTS_PER_SESSION, sessionIdOf } from "../demo"
import { HttpError } from "../errors"
import { toClient } from "../mappers"
import { buildSet } from "../sql"
import { isUuid, parseClientCreate, parseClientUpdate } from "../validation"

const COLUMNS = "id, name, email, company, status, value"
const UPDATABLE = {
  name: "name",
  email: "email",
  company: "company",
  status: "status",
  value: "value",
}

function requireClientId(id: string): string {
  if (!isUuid(id)) throw new HttpError(404, "Client not found")
  return id
}

// Every query is scoped to the visitor's sandbox (session_id), so one visitor
// can never read or change another visitor's clients, even with a known id.
export const clientsRouter = Router()

clientsRouter.get("/", async (_request, response) => {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM clients WHERE session_id = $1 ORDER BY name`,
    [sessionIdOf(response)]
  )
  response.json(result.rows.map(toClient))
})

clientsRouter.post("/", async (request, response) => {
  const input = parseClientCreate(request.body)
  const sessionId = sessionIdOf(response)
  // The INSERT only happens while the sandbox is below its limit.
  const result = await pool.query(
    `INSERT INTO clients (id, session_id, name, email, company, status, value)
     SELECT $1, $2, $3, $4, $5, $6, $7
     WHERE (SELECT count(*) FROM clients WHERE session_id = $2) < $8
     RETURNING ${COLUMNS}`,
    [
      randomUUID(),
      sessionId,
      input.name,
      input.email,
      input.company,
      input.status,
      input.value,
      MAX_CLIENTS_PER_SESSION,
    ]
  )
  if (result.rows.length === 0) throw new HttpError(409, "Demo limit reached")
  response.status(201).json(toClient(result.rows[0]))
})

clientsRouter.patch("/:id", async (request, response) => {
  const id = requireClientId(request.params.id)
  const { assignments, values } = buildSet(
    parseClientUpdate(request.body),
    UPDATABLE
  )
  const result = await pool.query(
    `UPDATE clients SET ${assignments}
     WHERE id = $${values.length + 1} AND session_id = $${values.length + 2}
     RETURNING ${COLUMNS}`,
    [...values, id, sessionIdOf(response)]
  )
  if (result.rows.length === 0) throw new HttpError(404, "Client not found")
  response.json(toClient(result.rows[0]))
})

clientsRouter.delete("/:id", async (request, response) => {
  const id = requireClientId(request.params.id)
  try {
    const result = await pool.query(
      "DELETE FROM clients WHERE id = $1 AND session_id = $2",
      [id, sessionIdOf(response)]
    )
    if (result.rowCount === 0) throw new HttpError(404, "Client not found")
  } catch (error) {
    if ((error as { code?: unknown }).code === "23503") {
      throw new HttpError(409, "Client has projects")
    }
    throw error
  }
  response.status(204).end()
})
