import { createApp } from "./app"
import pool from "./db"

const port = Number(process.env.PORT ?? 3000)

try {
  await pool.query("SELECT 1")
  console.log("PostgreSQL connected")
} catch (error) {
  console.error("PostgreSQL connection failed", error)
  process.exit(1)
}

createApp().listen(port, () => {
  console.log(`Orbit API listening on http://localhost:${port}`)
})
