import type { ErrorRequestHandler, RequestHandler } from "express"

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

type ErrorLike = { type?: unknown; code?: unknown }

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Not found" })
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }
  const { type, code } = (error ?? {}) as ErrorLike
  if (type === "entity.parse.failed") {
    response.status(400).json({ error: "Invalid JSON" })
    return
  }
  if (code === "23503") {
    response.status(400).json({ error: "Client not found" })
    return
  }
  if (code === "23514") {
    response.status(400).json({ error: "Constraint violation" })
    return
  }
  if (code === "22P02") {
    response.status(400).json({ error: "Invalid input" })
    return
  }
  // Other body-parser client errors (413 too large, 415 bad charset, ...)
  // carry their own 4xx status and a safe-to-expose message.
  const { status, expose, message } = (error ?? {}) as ErrorLike & {
    status?: unknown
    expose?: unknown
    message?: unknown
  }
  if (typeof status === "number" && status >= 400 && status < 500 && expose === true) {
    response.status(status).json({ error: typeof message === "string" ? message : "Bad request" })
    return
  }
  console.error(error)
  response.status(500).json({ error: "Internal server error" })
}
