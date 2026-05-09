# Lumina Health — Local Setup Guide

## Requirements

Install these before you start:

| Tool | Download |
|------|----------|
| Node.js 20+ | https://nodejs.org |
| pnpm | Run: `npm install -g pnpm` |
| PostgreSQL 15+ | https://www.postgresql.org/download |

---

## Step 1 — Install dependencies

```bash
pnpm install
```

---

## Step 2 — Create your environment file

Create a file called `.env` in the `artifacts/api-server/` folder:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/lumina_health
SESSION_SECRET=any-long-random-string-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
VAPID_PUBLIC_KEY=BGpnpVodto8GnZ43UIriYK6xD-IDKMfWpvXhJWoPMMuqFQKP-AvFVrw2JI79J_mFiXJvBE9SpDdoLfZA0Mi-aPc
VAPID_PRIVATE_KEY=iBqnmgu_qBxTspi8glcWaWs5JdcpfpzIIPSdHDfxH54
VAPID_EMAIL=admin@lumina-health.app
PORT=8080
```

> Replace `yourpassword` with your PostgreSQL password and add your real OpenAI API key.

---

## Step 3 — Create the database

Open your PostgreSQL terminal (psql) and run:

```sql
CREATE DATABASE lumina_health;
```

Then run the schema migration:

```bash
psql postgresql://postgres:yourpassword@localhost:5432/lumina_health -f schema.sql
```

Or paste this SQL directly:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  confidence NUMERIC,
  confidence_level TEXT,
  values JSONB,
  possible_conditions JSONB,
  explanation TEXT,
  emergency_alert BOOLEAN DEFAULT FALSE,
  emergency_message TEXT,
  recommendations JSONB,
  disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS image_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  confidence NUMERIC,
  confidence_level TEXT,
  results JSONB,
  overall_wellness TEXT,
  disclaimer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  meals JSONB,
  calories_target INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Step 4 — Start the API server

Open a terminal in the project root and run:

```bash
pnpm --filter @workspace/api-server run dev
```

The API server starts at **http://localhost:8080**

---

## Step 5 — Start the frontend

Open a second terminal in the project root and run:

```bash
pnpm --filter @workspace/health-assistant run dev
```

The app opens at **http://localhost:5173**

---

## All commands at a glance

```bash
# 1. Install everything
pnpm install

# 2. Start API (keep this terminal open)
pnpm --filter @workspace/api-server run dev

# 3. Start frontend in a new terminal (keep this terminal open)
pnpm --filter @workspace/health-assistant run dev
```

Then open **http://localhost:5173** in your browser.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pnpm: command not found` | Run `npm install -g pnpm` first |
| `Cannot connect to database` | Check your DATABASE_URL in `.env` and make sure PostgreSQL is running |
| `OpenAI error` | Check your API key is valid and has credits |
| Port 8080 already in use | Change `PORT=8081` in `.env` |
| Blank page on frontend | Make sure the API server is running first |
