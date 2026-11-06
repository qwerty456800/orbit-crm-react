import "dotenv/config"
import pg from "pg"

// DATE (oid 1082) stays a "YYYY-MM-DD" string instead of a local-time Date,
// so deadlines never shift by a day during JSON serialization.
pg.types.setTypeParser(1082, (value) => value)

// In the cloud (Neon, Render, ...) the database is given as one DATABASE_URL.
// Locally the separate DB_* variables from .env are used, as before.
const connectionString = process.env.DATABASE_URL

const pool = connectionString
  ? new pg.Pool({
      connectionString,
      // Hosted Postgres requires TLS (certificate is verified).
      // DATABASE_SSL=false turns it off only for a local URL without TLS.
      ssl: process.env.DATABASE_SSL !== "false",
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })
  : new pg.Pool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? "orbit_crm",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD,
    })

export default pool
