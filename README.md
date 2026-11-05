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
| `validation.ts` | Request body validation |
| `schema.sql` | Idempotent database schema, applied by `npm run db:migrate` |

Configuration comes from `.env`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`.

Errors are returned as JSON `{ "error": "message" }`:

- `400` invalid input (for example `email is invalid`, `Client not found` for an unknown `clientId`)
- `404` unknown record or route
- `409` deleting a client that still has projects (`Client has projects`)
- `500` unexpected server or database error (details are logged on the server only)

With the API running, `npx tsx server/scripts/smoke.ts` checks every endpoint and error code; it cleans up the records it creates.

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
