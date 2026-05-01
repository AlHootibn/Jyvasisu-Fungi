# JyväSisu Fungi — Live Deployment

---

## Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://jyvasisu-fungi-app.onrender.com |
| **Backend API** | https://jyvasisu-fungi-api.onrender.com |
| **Health Check** | https://jyvasisu-fungi-api.onrender.com/api/health |
| **WebSocket** | wss://jyvasisu-fungi-api.onrender.com/ws |

---

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@farm.com | admin123 | Super Admin |
| owner@farm.com | owner123 | Farm Owner |
| manager@farm.com | manager123 | Farm Manager |
| worker@farm.com | worker123 | Worker |
| viewer@farm.com | viewer123 | Viewer |

---

## Hosting Platform

Everything is hosted on **[Render](https://render.com)** (free tier) under the workspace **My Workspace** (`tea-d7q8es9j2pic73fitkr0`).

| Resource | Render ID | Plan |
|---|---|---|
| PostgreSQL Database | `dpg-d7q8hee8bjmc73bulfd0-a` | Free |
| Backend Web Service | `srv-d7q8kpn7f7vs73cp6fsg` | Free |
| Frontend Static Site | `srv-d7qbdu68bjmc73c1culg` | Free |

Render Dashboard: https://dashboard.render.com

---

## Environment Variables

### Backend (`srv-d7q8kpn7f7vs73cp6fsg`)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal PostgreSQL connection string (auto-set) |
| `JWT_SECRET` | `jyvasisu-fungi-jwt-secret-hisham-2026-secure` |
| `CLIENT_ORIGIN` | `https://jyvasisu-fungi-app.onrender.com` |
| `NODE_ENV` | `production` |
| `PORT` | Set automatically by Render |

### Frontend (`srv-d7qbdu68bjmc73c1culg`)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://jyvasisu-fungi-api.onrender.com` |

---

## Database

| Detail | Value |
|---|---|
| Name | `jyvasisu-fungi-db` |
| Database | `jyvasisu_fungi` |
| User | `jyvasisu_admin` |
| Region | Oregon (US West) |
| Version | PostgreSQL 17 |
| Expires | 2026-05-31 (free tier is 90 days) |

**External connection string** (for local tools like pgAdmin or TablePlus):
```
postgresql://jyvasisu_admin:tni0LQqv58VI8JIKTdW5zIxpPqubyQ0v@dpg-d7q8hee8bjmc73bulfd0-a.oregon-postgres.render.com:5432/jyvasisu_fungi
```

**psql command:**
```bash
PGPASSWORD=tni0LQqv58VI8JIKTdW5zIxpPqubyQ0v psql -h dpg-d7q8hee8bjmc73bulfd0-a.oregon-postgres.render.com -p 5432 -U jyvasisu_admin jyvasisu_fungi
```

---

## How Auto-Deployment Works

Every `git push origin main` automatically redeploys both services:

1. **Backend** — Render detects the push, runs `npm install`, restarts the server. On startup, `server/index.js` calls `db/setup.js` which:
   - Creates all tables (idempotent — `CREATE TABLE IF NOT EXISTS`)
   - Seeds users with `ON CONFLICT (email) DO UPDATE`
   - Seeds rooms, devices, rules, and inventory only if they don't exist yet
2. **Frontend** — Render runs `npm install && npm run build`, publishes the `dist/` folder. `VITE_API_URL` is baked in at build time.

No manual steps required after pushing.

---

## Free Tier Limitations

| Limitation | Detail |
|---|---|
| **Backend sleep** | Sleeps after 15 min of inactivity. First request after idle takes ~30 seconds to wake up. |
| **Database expiry** | Free PostgreSQL expires after 90 days (by **2026-05-31**). Upgrade to a paid plan or migrate to [Supabase](https://supabase.com) (free forever) before then. |
| **Build minutes** | 400 free build minutes/month — more than enough for normal use. |
| **Static site** | Unlimited requests, no sleep. |

---

## Extending the Free Database (Before Expiry)

To avoid losing data when the free PostgreSQL expires, migrate to Supabase:

1. Create a free project at [supabase.com](https://supabase.com)
2. Get the connection string from **Project Settings → Database → Connection String (URI)**
3. In Render Dashboard → Backend service → Environment → update `DATABASE_URL` to the Supabase URL
4. The server will auto-run `setup.js` on next restart and recreate all tables and base data

---

## Render API Key

Used to deploy this project programmatically:

```
rnd_zfaNJzkKcmfV3I2yycUuqCxsGu2P
```

> Keep this private — it has full control over your Render workspace.

---

## Deployed On

2026-05-01 by Claude Code (Anthropic) via the Render REST API.
