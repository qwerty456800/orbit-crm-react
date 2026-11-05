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
