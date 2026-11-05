// Smoke check of the Orbit API against a running server.
// Usage: npm run server:start  (in another terminal), then: npx tsx server/scripts/smoke.ts
// Creates its own records and deletes them at the end.

export {}

const API = process.env.API ?? "http://localhost:3000"
const MISSING_ID = "00000000-0000-0000-0000-000000000000"
let failures = 0

type ResponseBody = Record<string, unknown> | null

async function check(
  expected: number,
  method: string,
  path: string,
  body?: string,
  contentType = "application/json"
): Promise<ResponseBody> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": contentType },
    body,
  })
  const text = await response.text()
  let parsed: ResponseBody = null
  try {
    parsed = text ? (JSON.parse(text) as ResponseBody) : null
  } catch {
    parsed = null
  }
  if (response.status === expected) {
    console.log(`PASS ${expected} ${method} ${path}`)
  } else {
    failures++
    console.log(`FAIL ${response.status} (want ${expected}) ${method} ${path} ${text.slice(0, 120)}`)
  }
  return parsed
}

function expect(label: string, condition: boolean): void {
  if (condition) {
    console.log(`PASS ${label}`)
  } else {
    failures++
    console.log(`FAIL ${label}`)
  }
}

const json = (value: unknown) => JSON.stringify(value)
const validClient = {
  name: "Smoke",
  email: "smoke@test.io",
  company: "Smoke Co",
  status: "Lead",
  value: 10,
}

// --- clients ---
await check(200, "GET", "/api/clients")
const created = await check(201, "POST", "/api/clients", json(validClient))
const CID = String(created?.id ?? MISSING_ID)

await check(400, "POST", "/api/clients", json({ ...validClient, name: "" }))
await check(400, "POST", "/api/clients", json({ ...validClient, email: "bad" }))
await check(400, "POST", "/api/clients", json({ ...validClient, status: "VIP" }))
await check(400, "POST", "/api/clients", json({ ...validClient, value: -5 }))
const badJson = await check(400, "POST", "/api/clients", "{bad")
expect("invalid JSON message", badJson?.error === "Invalid JSON")
// Body-parser client errors keep their 4xx status instead of becoming 500.
await check(413, "POST", "/api/clients", json({ ...validClient, name: "x".repeat(200_000) }))
await check(
  415,
  "POST",
  "/api/clients",
  json(validClient),
  "application/json; charset=latin9"
)

const patched = await check(200, "PATCH", `/api/clients/${CID}`, json({ value: 20 }))
expect("patched value is number 20", patched?.value === 20)
// Browser <input type="email"> accepts addresses without a domain dot.
await check(200, "PATCH", `/api/clients/${CID}`, json({ email: "asad@asd" }))
await check(400, "PATCH", `/api/clients/${CID}`, json({ email: "two words@x.io" }))
await check(400, "PATCH", `/api/clients/${CID}`, json({}))
await check(400, "PATCH", `/api/clients/${CID}`, json({ foo: 1 }))
await check(404, "PATCH", "/api/clients/not-a-uuid", json({ value: 1 }))
await check(404, "PATCH", `/api/clients/${MISSING_ID}`, json({ value: 1 }))
await check(404, "GET", "/api/nope")

// --- projects ---
const validProject = {
  clientId: CID,
  title: "Smoke project",
  status: "In progress",
  progress: 40,
  deadline: "2026-11-15",
}
await check(200, "GET", "/api/projects")
const project = await check(201, "POST", "/api/projects", json(validProject))
const PID = String(project?.id ?? MISSING_ID)
expect("deadline round-trips exactly", project?.deadline === "2026-11-15")
expect("clientId round-trips", project?.clientId === CID)

const noClient = await check(
  400,
  "POST",
  "/api/projects",
  json({ ...validProject, clientId: MISSING_ID })
)
expect("unknown client message", noClient?.error === "Client not found")
await check(400, "POST", "/api/projects", json({ ...validProject, progress: 101 }))
await check(400, "POST", "/api/projects", json({ ...validProject, progress: 1.5 }))
await check(400, "POST", "/api/projects", json({ ...validProject, status: "Done" }))
await check(400, "POST", "/api/projects", json({ ...validProject, deadline: "2026-13-40" }))
await check(400, "POST", "/api/projects", json({ ...validProject, deadline: "2026-02-30" }))
await check(400, "POST", "/api/projects", json({ ...validProject, title: "  " }))

const completed = await check(
  200,
  "PATCH",
  `/api/projects/${PID}`,
  json({ status: "Completed", progress: 100, progressBeforeCompleted: 40 })
)
expect("progressBeforeCompleted stored", completed?.progressBeforeCompleted === 40)
const restored = await check(
  200,
  "PATCH",
  `/api/projects/${PID}`,
  json({ status: "In progress", progress: 0, progressBeforeCompleted: null })
)
expect("progress 0 accepted", restored?.progress === 0)
expect(
  "progressBeforeCompleted cleared",
  restored !== null && !("progressBeforeCompleted" in restored)
)
await check(400, "PATCH", `/api/projects/${PID}`, json({ status: "anything" }))
await check(400, "PATCH", `/api/projects/${PID}`, json({}))
await check(404, "PATCH", `/api/projects/${MISSING_ID}`, json({ progress: 5 }))

const blocked = await check(409, "DELETE", `/api/clients/${CID}`)
expect("client has projects message", blocked?.error === "Client has projects")
await check(204, "DELETE", `/api/projects/${PID}`)
await check(404, "DELETE", `/api/projects/${PID}`)

// --- cleanup ---
await check(204, "DELETE", `/api/clients/${CID}`)
await check(404, "DELETE", `/api/clients/${CID}`)

console.log(failures === 0 ? "\nSMOKE OK" : `\nSMOKE FAILED: ${failures} failure(s)`)
process.exitCode = failures === 0 ? 0 : 1
