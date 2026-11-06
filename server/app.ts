import cors from "cors"
import express, { type Express } from "express"
import { demoRouter, requireDemoSession } from "./demo"
import { errorHandler, notFoundHandler } from "./errors"
import { clientsRouter } from "./routes/clients"
import { projectsRouter } from "./routes/projects"

// CORS_ORIGIN lists the frontends allowed to call the API, comma-separated
// (e.g. "https://orbit-crm.vercel.app"). Unset = any origin (local development).
function corsOrigin(): string[] | true {
  const origins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
  return origins.length > 0 ? origins : true
}

export function createApp(): Express {
  const app = express()
  app.use(cors({ origin: corsOrigin() }))
  app.use(express.json())
  app.use((_request, response, next) => {
    response.set("Cache-Control", "no-store")
    next()
  })

  app.get("/", (_request, response) => {
    response.send("Orbit Api is running")
  })

  // Every /api route works inside the visitor's own demo sandbox.
  app.use("/api", requireDemoSession)
  app.use("/api/clients", clientsRouter)
  app.use("/api/projects", projectsRouter)
  app.use("/api/demo", demoRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
