import { randomUUID } from "node:crypto"
import { Router } from "express"
import pool from "../db"
import { HttpError } from "../errors"
import { toClient } from "../mappers"
import { buildSet } from "../sql"
import { isUuid, parseClientCreate, parseClientUpdate } from "../validation"

const COLUMNS = "id, name, email, company, status, value"
const UPDATABLE = { name: "name", email: "email", company: "company", status: "status", value: "value" }

function requireClientId(id: string): string {
  if (!isUuid(id)) throw new HttpError(404, "Client not found")
  return id
}

export const clientsRouter = Router()

clientsRouter.get("/", async (_request, response) => {
  const result = await pool.query(`SELECT ${COLUMNS} FROM clients ORDER BY name`)
  response.json(result.rows.map(toClient))
})

clientsRouter.post("/", async (request, response) => {
  const input = parseClientCreate(request.body)
  const result = await pool.query(
    `INSERT INTO clients (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
    [randomUUID(), input.name, input.email, input.company, input.status, input.value]
  )
  response.status(201).json(toClient(result.rows[0]))
})

clientsRouter.patch("/:id", async (request, response) => {
  const id = requireClientId(request.params.id)
  const { assignments, values } = buildSet(parseClientUpdate(request.body), UPDATABLE)
  const result = await pool.query(
    `UPDATE clients SET ${assignments} WHERE id = $${values.length + 1} RETURNING ${COLUMNS}`,
    [...values, id]
  )
  if (result.rows.length === 0) throw new HttpError(404, "Client not found")
  response.json(toClient(result.rows[0]))
})

clientsRouter.delete("/:id", async (request, response) => {
  const id = requireClientId(request.params.id)
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1", [id])
    if (result.rowCount === 0) throw new HttpError(404, "Client not found")
  } catch (error) {
    if ((error as { code?: unknown }).code === "23503") {
      throw new HttpError(409, "Client has projects")
    }
    throw error
  }
  response.status(204).end()
})
