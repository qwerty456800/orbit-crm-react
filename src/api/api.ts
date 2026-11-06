// Set VITE_API_URL in the hosting dashboard (e.g. Vercel) to the deployed API.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"

const SESSION_KEY = "orbitDemoSession"
let memorySessionId: string | null = null

// Each visitor gets an own demo sandbox on the server, identified by this id.
// It is kept in localStorage so the visitor sees the same data after a reload.
export function getDemoSessionId(): string {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) return saved
    const created = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    // Storage blocked (private mode): keep one id for this page load.
    memorySessionId ??= crypto.randomUUID()
    return memorySessionId
  }
}

// fetch() against the API with the demo-session header added.
export function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set("X-Demo-Session", getDemoSessionId())
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}

// Builds an Error from the server's `{ error }` body, falling back to `fallback`.
export async function readError(
  response: Response,
  fallback: string
): Promise<Error> {
  try {
    const body: unknown = await response.json()
    if (
      typeof body === "object" &&
      body !== null &&
      typeof (body as { error?: unknown }).error === "string"
    ) {
      return new Error((body as { error: string }).error)
    }
  } catch {
    // Non-JSON or empty body: use the fallback message.
  }
  return new Error(fallback)
}
