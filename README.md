# Orbit CRM

Orbit CRM is a focused React dashboard for managing client relationships, projects, activity, and workspace settings.

## Stack

- React 19
- Vite
- React Router
- Oxlint
- Prettier
- CSS (no UI framework)

## Features

- Client directory with search, status changes, editing, deletion, and value tracking
- Project board with filters, progress controls, status transitions, and deadlines
- Projects linked to clients through `clientId`
- Dashboard with activity, summaries, and upcoming deadlines
- Global `SettingsContext` with EUR, USD, and GBP currency conversion
- Persistent clients, projects, activity, and settings via `localStorage`
- Accessible modal dialogs with Escape-to-close, initial focus, focus trapping, and focus restoration
- Responsive interface for day-to-day CRM work

## Screenshots

Add product screenshots to `docs/screenshots/` and reference them here:

![Dashboard](docs/screenshots/dashboard.png)

![Clients](docs/screenshots/clients.png)

![Projects](docs/screenshots/projects.png)

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

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
