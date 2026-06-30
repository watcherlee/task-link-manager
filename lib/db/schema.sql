CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL DEFAULT 'default',
  kind        TEXT NOT NULL DEFAULT 'task',
  title       TEXT NOT NULL,
  url         TEXT,
  platform    TEXT,
  notes       TEXT,
  stage       TEXT NOT NULL DEFAULT 'inbox',
  category    TEXT NOT NULL DEFAULT 'work',
  priority    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  done        INTEGER NOT NULL DEFAULT 0,
  done_at     TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL UNIQUE,
  preset INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id  TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_stage ON tasks(stage, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);
