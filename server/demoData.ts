import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"
import type { ClientStatus, ProjectStatus } from "../src/types/models"

// Starter data every new demo sandbox receives. Example domains (.example)
// are reserved, so no real person or company is referenced.
const DEMO_CLIENTS: {
  name: string
  email: string
  company: string
  status: ClientStatus
  value: number
}[] = [
  {
    name: "Lena Hoffmann",
    email: "lena@nordlicht.example",
    company: "Nordlicht Studio",
    status: "Active",
    value: 12500,
  },
  {
    name: "Marco Rossi",
    email: "marco@vela-logistics.example",
    company: "Vela Logistics",
    status: "Active",
    value: 28400,
  },
  {
    name: "Sofia Nowak",
    email: "sofia@pixelgarten.example",
    company: "Pixelgarten",
    status: "Lead",
    value: 6800,
  },
  {
    name: "Jonas Berger",
    email: "jonas@alpenbyte.example",
    company: "AlpenByte GmbH",
    status: "Active",
    value: 19750,
  },
  {
    name: "Emma Laurent",
    email: "emma@maison-verte.example",
    company: "Maison Verte",
    status: "Lead",
    value: 4200,
  },
]

// `client` is an index into DEMO_CLIENTS; `due` is days from today, so
// deadlines stay "upcoming" no matter when the sandbox is created.
const DEMO_PROJECTS: {
  client: number
  title: string
  status: ProjectStatus
  progress: number
  due: number
}[] = [
  {
    client: 0,
    title: "Brand website relaunch",
    status: "In progress",
    progress: 65,
    due: 12,
  },
  {
    client: 0,
    title: "Newsletter templates",
    status: "Completed",
    progress: 100,
    due: -5,
  },
  {
    client: 1,
    title: "Fleet tracking dashboard",
    status: "In review",
    progress: 90,
    due: 4,
  },
  {
    client: 1,
    title: "Driver mobile app",
    status: "In progress",
    progress: 30,
    due: 40,
  },
  {
    client: 3,
    title: "Customer portal",
    status: "In progress",
    progress: 45,
    due: 21,
  },
  {
    client: 3,
    title: "SEO audit",
    status: "Completed",
    progress: 100,
    due: -12,
  },
  {
    client: 2,
    title: "Online shop concept",
    status: "In review",
    progress: 80,
    due: 7,
  },
]

function isoDate(daysFromToday: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

// Inserts the starter clients and projects for one session.
// Runs inside the caller's transaction (`db` is a checked-out client).
export async function seedDemoData(
  db: PoolClient,
  sessionId: string
): Promise<void> {
  const clientIds = DEMO_CLIENTS.map(() => randomUUID())

  for (const [index, client] of DEMO_CLIENTS.entries()) {
    await db.query(
      `INSERT INTO clients (id, session_id, name, email, company, status, value)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        clientIds[index],
        sessionId,
        client.name,
        client.email,
        client.company,
        client.status,
        client.value,
      ]
    )
  }

  for (const project of DEMO_PROJECTS) {
    await db.query(
      `INSERT INTO projects (id, session_id, client_id, title, status, progress, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        randomUUID(),
        sessionId,
        clientIds[project.client],
        project.title,
        project.status,
        project.progress,
        isoDate(project.due),
      ]
    )
  }
}
