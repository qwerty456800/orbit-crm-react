import "dotenv/config"
import pg from "pg"

// DATE (oid 1082) stays a "YYYY-MM-DD" string instead of a local-time Date,
// so deadlines never shift by a day during JSON serialization.
pg.types.setTypeParser(1082, (value) => value)

const pool = new pg.Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "orbit_crm",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
})

export default pool
