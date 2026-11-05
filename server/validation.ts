import type { Client, ClientStatus, Project, ProjectStatus } from "../src/types/models"
import { HttpError } from "./errors"

export type ClientInput = Omit<Client, "id">
export type ProjectInput = Omit<Project, "id" | "progressBeforeCompleted"> & {
  progressBeforeCompleted?: number | null
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Matches what the browser accepts for <input type="email"> (domain dot not required).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const CLIENT_STATUSES: readonly ClientStatus[] = ["Active", "Lead"]
const PROJECT_STATUSES: readonly ProjectStatus[] = ["In progress", "In review", "Completed"]

type Fields = Record<string, unknown>
type Parser = (value: unknown) => unknown

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

function invalid(field: string): never {
  throw new HttpError(400, `${field} is invalid`)
}

function asObject(body: unknown): Fields {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "Body must be a JSON object")
  }
  return body as Fields
}

const text: Parser = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined

const email: Parser = (value) => {
  const trimmed = text(value)
  return typeof trimmed === "string" && EMAIL_PATTERN.test(trimmed) ? trimmed : undefined
}

const oneOf =
  (options: readonly string[]): Parser =>
  (value) =>
    typeof value === "string" && options.includes(value) ? value : undefined

const money: Parser = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined

const percent: Parser = (value) =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 100
    ? value
    : undefined

const nullablePercent: Parser = (value) => (value === null ? null : percent(value))

const uuid: Parser = (value) => (typeof value === "string" && isUuid(value) ? value : undefined)

const isoDate: Parser = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return undefined
  const date = new Date(`${value}T00:00:00Z`)
  // Rejects impossible dates like 2026-02-30 that Date would roll over.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? value : undefined
}

const clientFields: Record<keyof ClientInput, Parser> = {
  name: text,
  email,
  company: text,
  status: oneOf(CLIENT_STATUSES),
  value: money,
}

const projectFields: Record<keyof ProjectInput, Parser> = {
  clientId: uuid,
  title: text,
  status: oneOf(PROJECT_STATUSES),
  progress: percent,
  progressBeforeCompleted: nullablePercent,
  deadline: isoDate,
}

// Parses known fields only; unknown keys are ignored. `required` lists fields
// that must be present (create); for updates at least one field is required.
function parseFields(
  body: unknown,
  parsers: Record<string, Parser>,
  required: readonly string[] | "atLeastOne"
): Fields {
  const input = asObject(body)
  const result: Fields = {}
  for (const [field, parse] of Object.entries(parsers)) {
    if (input[field] === undefined) {
      if (required !== "atLeastOne" && required.includes(field)) invalid(field)
      continue
    }
    const parsed = parse(input[field])
    if (parsed === undefined) invalid(field)
    result[field] = parsed
  }
  if (required === "atLeastOne" && Object.keys(result).length === 0) {
    throw new HttpError(400, "No fields to update")
  }
  return result
}

export function parseClientCreate(body: unknown): ClientInput {
  return parseFields(body, clientFields, Object.keys(clientFields)) as ClientInput
}

export function parseClientUpdate(body: unknown): Partial<ClientInput> {
  return parseFields(body, clientFields, "atLeastOne") as Partial<ClientInput>
}

const requiredProjectFields = Object.keys(projectFields).filter(
  (field) => field !== "progressBeforeCompleted"
)

export function parseProjectCreate(body: unknown): ProjectInput {
  return parseFields(body, projectFields, requiredProjectFields) as ProjectInput
}

export function parseProjectUpdate(body: unknown): Partial<ProjectInput> {
  return parseFields(body, projectFields, "atLeastOne") as Partial<ProjectInput>
}
