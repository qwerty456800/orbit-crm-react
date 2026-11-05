import cors from "cors"
import express, { type Express } from "express"
import { errorHandler, notFoundHandler } from "./errors"

export function createApp(): Express {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use((_request, response, next) => {
    response.set("Cache-Control", "no-store")
    next()
  })

  app.get("/", (_request, response) => {
    response.send("Orbit Api is running")
  })

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
