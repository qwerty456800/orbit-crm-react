export const API_BASE_URL = "http://localhost:3000"

// Builds an Error from the server's `{ error }` body, falling back to `fallback`.
export async function readError(response: Response, fallback: string): Promise<Error> {
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
