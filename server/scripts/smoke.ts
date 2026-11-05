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
  body?: string
): Promise<ResponseBody> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
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

const patched = await check(200, "PATCH", `/api/clients/${CID}`, json({ value: 20 }))
expect("patched value is number 20", patched?.value === 20)
await check(400, "PATCH", `/api/clients/${CID}`, json({}))
await check(400, "PATCH", `/api/clients/${CID}`, json({ foo: 1 }))
await check(404, "PATCH", "/api/clients/not-a-uuid", json({ value: 1 }))
await check(404, "PATCH", `/api/clients/${MISSING_ID}`, json({ value: 1 }))
await check(404, "GET", "/api/nope")

// --- projects (Task 3) ---

// --- cleanup ---
await check(204, "DELETE", `/api/clients/${CID}`)
await check(404, "DELETE", `/api/clients/${CID}`)

console.log(failures === 0 ? "\nSMOKE OK" : `\nSMOKE FAILED: ${failures} failure(s)`)
process.exitCode = failures === 0 ? 0 : 1
