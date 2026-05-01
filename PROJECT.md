# JyväSisu Fungi — Project Documentation

IoT Mushroom Farm Management System  
Location: Jyväskylä, Finland  
Owner: Hisham AlHoot (`admin@farm.com`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 + Recharts |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL 17 |
| Real-time | WebSocket (`ws` library) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Icons | Lucide React |
| Dates | date-fns |

---

## Project Structure

```
Farm/
├── client/                        # React frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # JWT login, logout, canAccess(), updateCurrentUser()
│   │   │   ├── FarmContext.jsx    # All app state, API calls, WebSocket, wsConnected
│   │   │   ├── ThemeContext.jsx   # Dark/light mode (toggles .dark on <html>)
│   │   │   └── ToastContext.jsx   # Global toast notifications (error/success/warning/info)
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login form + quick demo buttons
│   │   │   ├── Dashboard.jsx      # Overview: sensors, devices, alerts, harvest
│   │   │   ├── FarmOverview.jsx   # Farm info + room cards + room CRUD
│   │   │   ├── RoomDetails.jsx    # Single room sensors, devices, real 24h history
│   │   │   ├── Devices.jsx        # All devices across all rooms
│   │   │   ├── Automation.jsx     # Automation rules CRUD + toggle
│   │   │   ├── Alerts.jsx         # Alert list, filters, acknowledge, pagination
│   │   │   ├── Tasks.jsx          # Task management (assign, status, priority)
│   │   │   ├── Production.jsx     # Harvest logs + delete with inline confirm
│   │   │   ├── Inventory.jsx      # Inventory table + edit/restock/delete
│   │   │   ├── Reports.jsx        # Charts, analytics, CSV export, PDF export
│   │   │   ├── Users.jsx          # User management + add/edit/delete + password change
│   │   │   └── Settings.jsx       # Profile settings wired to API, password change
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx     # App shell wrapper
│   │   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   │   └── Header.jsx     # Top bar with alerts badge + WS connection indicator
│   │   │   ├── Dashboard/
│   │   │   │   ├── SensorCard.jsx # Sensor reading display card
│   │   │   │   └── DeviceCard.jsx # Device toggle card
│   │   │   ├── Charts/
│   │   │   │   └── SensorLineChart.jsx # 24h sensor trend chart (real data or mock fallback)
│   │   │   ├── ReportPDF.jsx      # @react-pdf/renderer — 2-page A4 PDF report
│   │   │   └── UI/
│   │   │       ├── Badge.jsx
│   │   │       └── Toggle.jsx
│   │   └── services/
│   │       └── api.js             # All API calls + WebSocket connector (onConnect/onDisconnect)
│
├── server/                        # Node.js backend
│   ├── index.js                   # Express app, WebSocket, route mounting
│   ├── .env                       # Secrets (not committed)
│   ├── config/
│   │   └── db.js                  # PostgreSQL pool
│   ├── middleware/
│   │   └── auth.js                # JWT verify + role hierarchy check
│   ├── routes/
│   │   ├── auth.js                # POST /login, POST /register, GET /me
│   │   ├── users.js               # GET/PUT/DELETE /users
│   │   ├── farms.js               # GET/POST/PUT /farms
│   │   ├── rooms.js               # GET/POST/PUT/DELETE /rooms
│   │   ├── devices.js             # GET/POST/PUT/DELETE /devices
│   │   ├── sensors.js             # GET /latest, GET /:room_id, POST (IoT)
│   │   ├── automation.js          # GET/POST/PUT/DELETE /automation
│   │   ├── alerts.js              # GET/POST/PUT /alerts
│   │   ├── tasks.js               # GET/POST/PUT/DELETE /tasks
│   │   ├── harvest.js             # GET/POST/DELETE /harvest
│   │   └── inventory.js           # GET/POST/PUT/DELETE /inventory
│   ├── services/
│   │   ├── sensorSimulator.js     # Simulates IoT readings every 3s → DB + WS
│   │   └── automation.js          # Automation engine runs every 10s
│   └── db/
│       ├── schema.sql             # All table definitions
│       ├── init.js                # Creates DB + seeds base data
│       ├── seed-demo.js           # Adds rich demo data for testing
│       └── clear-demo.js          # Removes demo data, keeps base data
```

---

## How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL 17 running on localhost:5432
- Password: `admin123` for user `postgres`

### First-time setup
```bash
# 1. Initialize database (creates tables + seeds base data)
cd server
node db/init.js

# 2. Start backend
node index.js

# 3. Start frontend (separate terminal)
cd client
npm run dev
```

### Daily start
```bash
# Terminal 1 — backend
cd server && node index.js

# Terminal 2 — frontend
cd client && npm run dev
```

### URLs
- Frontend: http://localhost:5132
- Backend API: http://localhost:3001/api
- WebSocket: ws://localhost:3001/ws
- Health check: http://localhost:3001/api/health

---

## Environment Variables (`server/.env`)

```env
PORT=3001
JWT_SECRET=change-this-to-a-long-random-secret

DB_HOST=localhost
DB_PORT=5432
DB_NAME=jyvasisu_fungi
DB_USER=postgres
DB_PASSWORD=admin123
```

---

## Database Schema

### Tables

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password_hash, role, avatar, created_at |
| `farms` | id, name, location, area, description, established, owner_id, status |
| `rooms` | id, farm_id, name, type, species, capacity, status, current_batch, batch_start_date, expected_harvest |
| `devices` | id, room_id, name, type, status, mode, power, api_key |
| `sensor_data` | id, room_id, device_id, temperature, humidity, co2, light, moisture, created_at |
| `automation_rules` | id, farm_id, room_id, name, description, condition_sensor, operator, condition_value, action_device, action_state, priority, is_active |
| `alerts` | id, farm_id, room_id, message, severity, type, acknowledged, created_at |
| `tasks` | id, farm_id, room_id, assigned_to, title, description, priority, status, due_date |
| `harvest_logs` | id, room_id, date, weight, quality, species, notes, created_at |
| `inventory` | id, farm_id, name, category, quantity, unit, min_quantity, cost, supplier, last_restocked |

### Sensor data normalization
The API returns snake_case from PostgreSQL. FarmContext normalizes to camelCase for the frontend:

| DB column | Frontend field |
|---|---|
| `room_id` | `roomId` |
| `farm_id` | `farmId` |
| `current_batch` | `currentBatch` |
| `expected_harvest` | `expectedHarvest` |
| `batch_start_date` | `batchStartDate` |
| `assigned_to` | `assignedTo` |
| `due_date` | `dueDate` |
| `is_active` | `isActive` |
| `min_quantity` | `minQuantity` |
| `last_restocked` | `lastRestocked` |
| `condition_sensor` + `operator` + `condition_value` | `condition: { sensor, operator, value }` |
| `action_device` + `action_state` | `action: { device, state }` |
| `room_name` (JOIN) | `roomName` |
| `created_at` | `timestamp` (alerts) / `date` (harvest) |
| `temperature` | `temperature` (sensor readings — no alias, matches DB column name) |

---

## API Endpoints

### Auth
```
POST /api/auth/login          — body: { email, password } → { token, user }
POST /api/auth/register       — body: { name, email, password, role } [Super Admin only]
GET  /api/auth/me             — returns current user from token
```

### Users
```
GET    /api/users             — list all users [Farm Owner+]
PUT    /api/users/:id         — update name/email/role/password [Farm Owner+]
DELETE /api/users/:id         — delete user [Super Admin only]
```
Super Admin accounts are protected — cannot be edited or deleted by anyone.

### Farms / Rooms / Devices
```
GET/POST        /api/farms
GET/POST/PUT    /api/rooms?farm_id=1
GET/POST/PUT/DELETE /api/devices?room_id=1
PUT             /api/devices/:id/control   — body: { status, mode }
```

### Sensors
```
GET  /api/sensor-data/latest          — latest reading per room (keyed by room_id)
GET  /api/sensor-data/:room_id?hours=24  — returns 10-min time-bucket averages (~144 points/24h)
POST /api/sensor-data                  — IoT device posts here (X-API-Key header)
```

### Automation / Alerts / Tasks / Harvest / Inventory
```
GET/POST/PUT/DELETE /api/automation?farm_id=1
GET/POST/PUT        /api/alerts?farm_id=1
PUT                 /api/alerts/:id/acknowledge
PUT                 /api/alerts/acknowledge-all
GET/POST/PUT/DELETE /api/tasks?farm_id=1
GET/POST/DELETE     /api/harvest?room_id=1&days=30
GET/POST/PUT/DELETE /api/inventory?farm_id=1
```

---

## Role & Permissions System

5-level hierarchy (lowest → highest):

| Role | Key Permissions |
|---|---|
| **Viewer** | Read-only dashboard, view reports |
| **Worker** | View tasks, input harvest, view sensors, mark tasks complete |
| **Farm Manager** | All above + control devices, acknowledge alerts, manage tasks |
| **Farm Owner** | All above + manage rooms, devices, automation rules, inventory |
| **Super Admin** | Full control + manage users, cannot be edited or deleted |

Enforced in two places:
- **Backend**: `auth(minRole)` middleware on every route
- **Frontend**: `canAccess(minRole)` from AuthContext hides/disables UI elements

---

## Real-time System

### Sensor Simulator (`server/services/sensorSimulator.js`)
- Runs every **3 seconds**
- Reads latest value per room from DB
- Applies small random drift (±0.2°C temp, ±0.6% humidity, ±15 ppm CO₂, etc.)
- Values clamped to physical limits: temp 10–40°C, humidity 0–100%, CO₂ 300–5000 ppm, light 0–2000, moisture 0–100%
- Inserts new row into `sensor_data`
- Broadcasts `{ type: 'sensor_update', roomId, data: { temperature, humidity, co2, light, moisture } }` via WebSocket

### Automation Engine (`server/services/automation.js`)
- Runs every **10 seconds**
- Fetches all active rules from DB
- Compares latest sensor reading per room against rule condition
- If triggered: updates device status in DB, broadcasts `device_update`
- Creates alert if threshold crossed (deduped — no duplicate within 5 min)

### WebSocket Messages (client receives)
| Type | Payload | Action |
|---|---|---|
| `connected` | `{ message }` | Confirmation on connect |
| `sensor_update` | `{ roomId, data: { temp, humidity, co2, light, moisture } }` | Updates sensors state |
| `device_update` | `{ deviceId, status, mode }` | Updates device in devices state |
| `new_alert` | `{ alert }` | Prepends to alerts state |

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

## Demo Data

### Add demo data (for testing all pages)
```bash
cd server
node db/seed-demo.js
```
Adds: 13 tasks (overdue/in-progress/pending/completed), 12 harvest logs (30 days), 144 sensor history readings (24h per room for charts), 11 inventory items (some low/out of stock), 7 alerts (mix of severity).

### Remove demo data
```bash
node db/clear-demo.js
```
Deletes: all tasks, harvest logs, extra sensor history, extra inventory items, all alerts.  
Keeps: farm, rooms, devices, users, automation rules.

---

## What Has Been Built (Completed)

### Backend
- [x] PostgreSQL schema with 10 tables
- [x] JWT authentication with 7-day expiry
- [x] Role-based middleware (`auth(minRole)`) on all routes
- [x] All 11 REST API route files
- [x] Sensor simulator writing real data to DB every 3s
- [x] Automation engine evaluating rules every 10s
- [x] WebSocket server broadcasting sensor/device/alert events
- [x] Super Admin protection — cannot be edited or deleted at API level
- [x] IoT device endpoint (POST /api/sensor-data with X-API-Key)
- [x] Alert deduplication (no duplicate alerts within 5 min window)
- [x] Database init script with base seed data
- [x] Demo data seed + clear scripts

### Frontend
- [x] AuthContext connected to real API (was mock DEMO_USERS before)
- [x] AuthContext `updateCurrentUser()` — updates name/email/password/avatar; persists to localStorage
- [x] FarmContext connected to real API — all state loaded from PostgreSQL on mount
- [x] FarmContext `deleteHarvestLog(id)` — calls `DELETE /api/harvest/:id`, removes from local state
- [x] FarmContext `wsConnected` state — tracks live WebSocket connection status
- [x] WebSocket integration — sensor/device/alert updates arrive live; `onConnect`/`onDisconnect` callbacks
- [x] ToastContext — global notification system (error/success/warning/info); all 19 silent errors now show toasts
- [x] snake_case → camelCase normalizers for all entities
- [x] All mutations (toggle device, add task, etc.) call API then update local state
- [x] Login page — async, handles API errors
- [x] Dashboard — sensor cards, device control, alerts, today's harvest stat; real 24h sensor history for charts
- [x] Farm Overview — farm header, room cards with live sensors, room add/edit/delete
- [x] Room Details — per-room sensors, devices, real 24h history per room fetched from API
- [x] Devices — all devices, filter by room, toggle on/off
- [x] Automation — rule list, toggle active, add new rule, delete
- [x] Alerts — filter by severity/status, acknowledge single or all; client-side "Show more" pagination (20 per batch)
- [x] Tasks — add task, assign to user, set priority/due date, mark complete, delete
- [x] Production/Harvest — log harvest entries, view history; hover-reveal delete with inline confirm
- [x] Inventory — table with restock, inline edit, delete with confirmation
- [x] Reports — charts/analytics with real sensor history; CSV export; PDF export (lazy-loaded `@react-pdf/renderer`)
- [x] Users — add user with role picker + permission preview, inline edit/delete; password change in edit form
- [x] Settings — profile section (name/email) wired to `PUT /api/users/:id`; password change with validation; save toast
- [x] Role permission preview shown when selecting roles (add/edit user)
- [x] Two-step confirmation pattern on all destructive actions (rooms, users, inventory, harvest)
- [x] Super Admin badge + protected status in Users page
- [x] "You" badge on current user's row
- [x] Loading spinner while data loads from API
- [x] Hover-reveal action buttons (edit/delete don't clutter the UI)
- [x] Header WebSocket indicator — green dot (live) / amber pulsing dot (reconnecting)
- [x] Light/dark theme — full theme switch via CSS custom property overrides; `html:not(.dark)` inverts slate palette

---

## Known Issues Fixed During Development

| Bug | Root Cause | Fix Applied |
|---|---|---|
| Login "Missing token" after AuthContext update | Old localStorage session had no JWT (was mock auth) | Log out and log back in — new session stores token |
| Farm Overview crash on load | `farms[0]` was `undefined` during API loading | Loading spinner guard before rendering |
| `batchStartDate` blank in room cards | `normalizeRoom` missed `batch_start_date → batchStartDate` | Added to normalizer |
| 6th sensor card showing a date string | `Object.entries(sensors[id])` included `updatedAt` field | Switched to explicit `SENSOR_KEYS` array |
| `farm.activeAlerts` shows undefined | DB `farms` table has no `activeAlerts` column | Computed live from `alerts.filter(a => !a.acknowledged).length` |
| Inventory `minQuantity` undefined | Normalizer had wrong field name (`low_stock_threshold` → actual is `min_quantity`) | Fixed to `minQuantity: i.min_quantity` |
| Inventory `lastRestocked` crash | Normalizer had wrong field name (`last_updated` → actual is `last_restocked`) | Fixed to `lastRestocked: i.last_restocked` |
| Add/edit inventory fails with API error | FarmContext sent camelCase fields; API expects snake_case | Explicit translation in `addInventoryItem` / `updateInventory` |
| PostgreSQL password auth failed on first setup | Default pg_hba.conf uses scram-sha-256, no password set | Changed to trust mode, reset password, restored original config |
| Port 3001 EADDRINUSE | Multiple node processes from background runs | `Stop-Process -Id <pid> -Force` in PowerShell |
| `u.lastLogin` crash in Users page | Field doesn't exist in DB — API returns `created_at` | Changed to show "Joined: {created_at}" |
| Harvest seed/normalizer mismatch | Schema uses `date`, `weight`, `quality` — not `batch_name`, `weight_kg`, `quality_grade` | Fixed normalizer and seed script |
| CORS rejected all API calls | `server/index.js` had hardcoded origin `http://localhost:5173`; frontend runs on 5132 | Changed to `http://localhost:5132` |
| Humidity showing 107.8% | Sensor simulator had no value clamping — random drift could exceed physical limits | Added `clamp(v, min, max)` helper with per-sensor limits |
| All sensor charts showed fake data | `SensorLineChart`, `Reports`, `Dashboard` all used `generateSensorHistory()` (random mock) | All pages now fetch real data from `GET /api/sensor-data/:room_id?hours=24` |
| `temperature AS temp` alias broke frontend | `sensors.js` history query aliased `temperature` to `temp`; frontend reads `r.temperature` | Removed alias; sensor history now returns raw column names |
| PDF export doubled bundle size | Static `import '@react-pdf/renderer'` added ~1.4MB to main bundle | Changed to dynamic `import()` inside button click handler; main bundle stays at ~771KB |
| Settings Save did nothing | Button showed "Saved!" flash animation but never called any API | Wired to `updateCurrentUser()` in AuthContext; shows success/error toast |
| All FarmContext API errors were silent | 19 `console.error` calls with no user feedback | All replaced with `showToast(err.message)` via new ToastContext |
| Light theme toggle had no visual effect | ThemeContext toggles `.dark` class, but all components use hardcoded dark Tailwind classes with no `dark:` variants | Added `html:not(.dark)` CSS custom property overrides in `index.css` to invert slate palette |

---

## Still To Do / Future Work

### Not Yet Implemented
- [ ] **Devices page** — filter-by-room dropdown not yet implemented
- [ ] **WebSocket authentication** — currently WS accepts any connection; should verify JWT on connect
- [ ] **ESP32 / real IoT hardware** — replace `sensorSimulator.js` with real hardware posting to `POST /api/sensor-data` using `X-API-Key` header
- [ ] **Multi-farm support** — currently hardcoded `farm_id = 1` in FarmContext; generalise for multiple farms
- [ ] **Email/push notifications** — for critical alerts when browser is closed
- [ ] **Batch tracking** — link harvest logs to specific batch names in rooms
- [ ] **GitHub Actions CI** — automated tests on push

---

## Git & GitHub

Repository: https://github.com/AlHootibn/Jyvasisu-Fungi.git

```bash
# Push latest changes
git add .
git commit -m "your message"
git push origin main
```

Git identity configured:
- Name: Hisham AlHoot
- Email: h.alhoot@gmail.com

---

## Quick Reference — Common Commands

```bash
# Re-seed the database from scratch
cd server && node db/init.js

# Add demo data
node db/seed-demo.js

# Remove demo data (keeps farm/rooms/devices/users/rules)
node db/clear-demo.js

# Kill any stuck node process on port 3001 (PowerShell)
netstat -ano | Select-String "3001"
Stop-Process -Id <PID> -Force

# Check backend is healthy
curl http://localhost:3001/api/health

# Test login from command line
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@farm.com\",\"password\":\"admin123\"}"
```

---

## Changelog

### Initial Build
- Full PostgreSQL backend — REST API, automation engine, WebSocket, DB schema
- React 19 frontend connected to real auth, live sensors, full CRUD

### Tech Stack Upgrade (May 2026)
- **Frontend**: Upgraded to React 19, Vite 8, React Router 7, Recharts 3
- **Styling**: Migrated to Tailwind CSS v4 — `@tailwindcss/vite` plugin, `@theme` block in CSS, no `postcss.config.js` or `tailwind.config.js`
- **Backend**: Upgraded to Express 5, pg 8.20.0
- **Port**: Frontend dev server moved to `5132`; Vite proxy uses `127.0.0.1`; CORS origin fixed to match

### Feature Sprint (May 2026)
- **Toast notifications** — `ToastContext` added globally; all silent API errors now surface as toasts
- **Real sensor charts** — `Dashboard`, `RoomDetails`, and `Reports` all fetch real 24h history from PostgreSQL instead of using mock random data
- **Sensor history downsampling** — `GET /api/sensor-data/:room_id` aggregates into 10-minute time buckets (PostgreSQL `FLOOR(EPOCH/600)`), reducing ~28,800 raw readings to ~144 data points per 24h window
- **Sensor simulator clamping** — added `clamp()` helper; values now stay within physical limits (e.g. humidity 0–100%)
- **WebSocket offline indicator** — green/amber pulsing dot in Header, driven by `wsConnected` state in FarmContext
- **Alerts pagination** — "Show more" loads 20 at a time; filter changes reset to first page
- **Delete harvest logs** — hover-reveal trash icon with inline confirm/cancel on Production page
- **Password change** — available in both the Users edit form and the Settings profile section
- **Settings Save wired** — profile name/email/password changes call `PUT /api/users/:id` and update JWT localStorage; shows success/error toast
- **PDF export** — `@react-pdf/renderer` generates a professional 2-page A4 PDF (KPI cards, 7-day bar chart, room/species breakdown, sensor snapshot, full harvest log table); lazy-loaded on demand so main bundle stays at ~771KB
- **Light theme** — `html:not(.dark)` CSS custom property overrides in `index.css` invert the Tailwind slate palette; the entire UI switches to a white/light-gray theme without any component changes
