import { Router, type RequestHandler, type Response } from "express"
import pool from "./db"
import { seedDemoData } from "./demoData"
import { HttpError } from "./errors"
import { isUuid } from "./validation"

// Every visitor works in an own sandbox, identified by a random UUID the
// browser generates once and sends with each request in this header.
export const SESSION_HEADER = "X-Demo-Session"

// Sandboxes not used for this many hours are deleted (with their data).
const SESSION_TTL_HOURS = Number(process.env.DEMO_SESSION_TTL_HOURS ?? 24)

// Caps per sandbox, so one visitor cannot fill the free database.
export const MAX_CLIENTS_PER_SESSION = 100
export const MAX_PROJECTS_PER_SESSION = 200

export function sessionIdOf(response: Response): string {
  return response.locals.sessionId as string
}

// Creates the session (and its starter data) on first sight; otherwise just
// marks it as recently used. Two parallel first requests are safe: the second
// INSERT waits on the first one's uncommitted row, then sees it as existing.
async function ensureSession(sessionId: string): Promise<void> {
  const db = await pool.connect()
  let created = false
  try {
    await db.query("BEGIN")
    const result = await db.query(
      `INSERT INTO demo_sessions (id) VALUES ($1)
       ON CONFLICT (id) DO UPDATE SET last_seen = now()
         WHERE demo_sessions.last_seen < now() - interval '1 minute'
       RETURNING (xmax = 0) AS created`,
      [sessionId]
    )
    created = result.rows[0]?.created === true
    if (created) await seedDemoData(db, sessionId)
    await db.query("COMMIT")
  } catch (error) {
    await db.query("ROLLBACK")
    throw error
  } finally {
    db.release()
  }

  // Housekeeping only when a new sandbox appears; failures must not break the request.
  if (created) {
    pool
      .query(
        "DELETE FROM demo_sessions WHERE last_seen < now() - make_interval(hours => $1)",
        [SESSION_TTL_HOURS]
      )
      .catch((error) => console.error("Demo session cleanup failed", error))
  }
}

export const requireDemoSession: RequestHandler = async (
  request,
  response,
  next
) => {
  const sessionId = request.get(SESSION_HEADER)
  if (!sessionId || !isUuid(sessionId)) {
    throw new HttpError(400, "Missing or invalid demo session")
  }
  await ensureSession(sessionId.toLowerCase())
  response.locals.sessionId = sessionId.toLowerCase()
  next()
}

// POST /api/demo/reset - wipes this visitor's sandbox and restores the starter data.
export const demoRouter = Router()

demoRouter.post("/reset", async (_request, response) => {
  const sessionId = sessionIdOf(response)
  const db = await pool.connect()
  try {
    await db.query("BEGIN")
    await db.query("DELETE FROM projects WHERE session_id = $1", [sessionId])
    await db.query("DELETE FROM clients WHERE session_id = $1", [sessionId])
    await seedDemoData(db, sessionId)
    await db.query("COMMIT")
  } catch (error) {
    await db.query("ROLLBACK")
    throw error
  } finally {
    db.release()
  }
  response.status(204).end()
})
