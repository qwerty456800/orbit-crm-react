-- Orbit CRM schema. Idempotent: safe to run on an empty or an existing database.

CREATE TABLE IF NOT EXISTS clients (
  id      UUID PRIMARY KEY,
  name    TEXT NOT NULL,
  email   TEXT NOT NULL,
  company TEXT NOT NULL,
  status  TEXT NOT NULL CHECK (status IN ('Active','Lead')),
  value   NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id        UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  title     TEXT NOT NULL,
  status    TEXT NOT NULL CHECK (status IN ('In progress','In review','Completed')),
  progress  INTEGER NOT NULL,
  deadline  DATE NOT NULL
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_before_completed INTEGER;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_progress_check;
ALTER TABLE projects ADD CONSTRAINT projects_progress_check
  CHECK (progress BETWEEN 0 AND 100);

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_progress_before_completed_check;
ALTER TABLE projects ADD CONSTRAINT projects_progress_before_completed_check
  CHECK (progress_before_completed BETWEEN 0 AND 100);

CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects(client_id);

-- Demo sandboxes: every visitor gets an own copy of the demo data.
-- Rows belong to a session; deleting the session deletes its clients and projects.
CREATE TABLE IF NOT EXISTS demo_sessions (
  id         UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_sessions_last_seen_idx ON demo_sessions(last_seen);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS session_id UUID
  REFERENCES demo_sessions(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS session_id UUID
  REFERENCES demo_sessions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS clients_session_id_idx ON clients(session_id);
CREATE INDEX IF NOT EXISTS projects_session_id_idx ON projects(session_id);
