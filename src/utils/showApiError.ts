// Shows an API failure to the user. The API clients throw Errors whose message
// is the server's `{ error }` text (see readError in src/api/api.ts).
export function showApiError(error: unknown, fallback: string): void {
  window.alert(error instanceof Error ? error.message : fallback)
}
