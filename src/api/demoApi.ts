import { apiFetch, readError } from "./api"

// Restores this visitor's sandbox to the starter clients and projects.
export async function resetDemoData(): Promise<void> {
  const response = await apiFetch(`/api/demo/reset`, { method: "POST" })
  if (!response.ok) {
    throw await readError(response, "Failed to reset demo data")
  }
}
