import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import pool from "../db"

const schemaPath = fileURLToPath(new URL("../schema.sql", import.meta.url))

async function migrate(): Promise<void> {
  const sql = await readFile(schemaPath, "utf8")
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(sql)
    await client.query("COMMIT")
    console.log("Migration applied")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Migration failed", error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

await migrate()
