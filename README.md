# Orbit CRM

Orbit CRM is a focused React dashboard for managing client relationships, projects, activity, and workspace settings.

## Stack

- React 19
- Vite
- React Router
- Oxlint
- Prettier
- CSS (no UI framework)
- Express 5 + PostgreSQL (`pg`) API

## Features

- Client directory with search, status changes, editing, deletion, and value tracking
- Project board with filters, progress controls, status transitions, and deadlines
- Projects linked to clients through `clientId`
- Dashboard with activity, summaries, and upcoming deadlines
- Global `SettingsContext` with EUR, USD, and GBP currency conversion
- Clients and projects stored in PostgreSQL through the Express API; activity and settings kept in `localStorage`
- Accessible modal dialogs with Escape-to-close, initial focus, focus trapping, and focus restoration
- Responsive interface for day-to-day CRM work

## Screenshots

Add product screenshots to `docs/screenshots/` and reference them here:

![Dashboard](docs/screenshots/dashboard.png)

![Clients](docs/screenshots/clients.png)

![Projects](docs/screenshots/projects.png)

## Getting started

Requirements: Node.js 20+, npm, and a running PostgreSQL server.

```bash
npm install
cp .env.example .env      # then set DB_PASSWORD (and other DB_* values if needed)
npm run db:migrate        # creates/updates tables; safe to run repeatedly
npm run server            # API on http://localhost:3000 (restarts on changes)
npm run dev               # frontend, in a second terminal
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Backend

The API lives in `server/`:

| Path | Purpose |
| --- | --- |
| `index.ts` | Entry point: checks the DB connection, starts listening on `PORT` (default 3000) |
| `app.ts` | Express app: middleware, routers, 404 and error handlers |
| `routes/clients.ts`, `routes/projects.ts` | CRUD endpoints under `/api/clients` and `/api/projects` |
| `demo.ts`, `demoData.ts` | Per-visitor demo sandboxes, starter data, `POST /api/demo/reset` |
| `validation.ts` | Request body validation |
| `schema.sql` | Idempotent database schema, applied by `npm run db:migrate` |

Configuration comes from `.env` (see `.env.example`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT` locally, or `DATABASE_URL` for a hosted database; plus `CORS_ORIGIN` and `DEMO_SESSION_TTL_HOURS`.

### Demo sandboxes

Every visitor works in an own sandbox, so the public demo can't be emptied by someone else:

- The browser generates a random session id once (`localStorage`) and sends it as the `X-Demo-Session` header with every API request.
- On the first request of a new session the server creates it and inserts starter clients and projects in the same transaction.
- Every query is filtered by `session_id`; a project can only reference a client from the same session.
- Sessions unused for `DEMO_SESSION_TTL_HOURS` (default 24) are deleted together with their data (`ON DELETE CASCADE`).
- Settings → *Reset demo data* restores the starter data. Each sandbox is capped at 100 clients and 200 projects.

Rows created before sandboxes existed have no `session_id` and are not shown in the app.

Errors are returned as JSON `{ "error": "message" }`:

- `400` invalid input (for example `email is invalid`, `Client not found` for an unknown `clientId`)
- `404` unknown record or route
- `400` missing or invalid `X-Demo-Session` header
- `409` deleting a client that still has projects (`Client has projects`), or a sandbox limit reached (`Demo limit reached`)
- `500` unexpected server or database error (details are logged on the server only)

With the API running, `npx tsx server/scripts/smoke.ts` checks every endpoint and error code, sandbox isolation and reset; it works in its own fresh sandboxes.

## Deployment

| Part | Service | Settings |
| --- | --- | --- |
| Database | [Neon](https://neon.tech) (free Postgres) | copy the connection string |
| API | [Render](https://render.com) web service (`render.yaml`) | `DATABASE_URL`, `CORS_ORIGIN` = the Vercel URL |
| Frontend | [Vercel](https://vercel.com) (`vercel.json` serves `index.html` for every route) | `VITE_API_URL` = the Render URL |

The free Render plan sleeps after 15 minutes without traffic; the first request afterwards takes up to a minute.

## Quality checks

```bash
npm run lint
npm run format:check
npm run build
```

Format files automatically with:

```bash
npm run format
```

VS Code is configured to run Prettier on save. Install the `Prettier - Code formatter` extension if it is not already installed.
