// Builds "col1 = $1, col2 = $2" from the fields present in `updates`,
// using a whitelist that maps API field names to DB column names.
export function buildSet(
  updates: Record<string, unknown>,
  columns: Record<string, string>
): { assignments: string; values: unknown[] } {
  const parts: string[] = []
  const values: unknown[] = []
  for (const [field, column] of Object.entries(columns)) {
    if (updates[field] === undefined) continue
    values.push(updates[field])
    parts.push(`${column} = $${values.length}`)
  }
  return { assignments: parts.join(", "), values }
}
