// Adds rich demo data for testing every page of the app
// Run:   node db/seed-demo.js
// Undo:  node db/clear-demo.js

require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jyvasisu_fungi',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

async function seed() {
  // ── Resolve IDs from existing data ────────────────────────────────────────
  const { rows: farms } = await pool.query(`SELECT id FROM farms LIMIT 1`)
  if (!farms[0]) { console.error('❌ No farm found — run node db/init.js first'); process.exit(1) }
  const farmId = farms[0].id

  const { rows: rooms } = await pool.query(`SELECT id, name FROM rooms WHERE farm_id=$1 ORDER BY id`, [farmId])
  if (!rooms.length) { console.error('❌ No rooms found — run node db/init.js first'); process.exit(1) }

  const { rows: users } = await pool.query(`SELECT id, role FROM users ORDER BY id`)
  const workerId   = users.find(u => u.role === 'Worker')?.id       || users[0].id
  const managerId  = users.find(u => u.role === 'Farm Manager')?.id || users[0].id
  const ownerId    = users.find(u => u.role === 'Farm Owner')?.id   || users[0].id

  const r0 = rooms[0].id   // Room A1
  const r1 = rooms[1]?.id  // Room B2
  const r2 = rooms[2]?.id  // Room C3

  const today    = new Date()
  const daysAgo  = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
  const daysFrom = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }

  // ── Tasks ─────────────────────────────────────────────────────────────────
  console.log('📋 Seeding tasks...')
  const tasks = [
    // Overdue
    { room: r2,   assigned: workerId,  title: 'Sterilize substrate in Room C3',       desc: 'Full substrate sterilization cycle needed before next batch',          priority: 'critical', status: 'pending',     due: daysAgo(3) },
    { room: r1,   assigned: managerId, title: 'Replace humidity sensor in Room B2',   desc: 'Sensor giving inconsistent readings — swap with spare unit',           priority: 'high',     status: 'pending',     due: daysAgo(1) },
    // In progress
    { room: r0,   assigned: workerId,  title: 'Harvest Room A1 — Batch #047',         desc: 'Pin flush ready, harvest into 1 kg consumer packs',                   priority: 'high',     status: 'in-progress', due: daysFrom(1) },
    { room: r2,   assigned: managerId, title: 'Install new CO₂ sensor in Room C3',    desc: 'Calibrate and connect to automation system after install',             priority: 'high',     status: 'in-progress', due: daysFrom(2) },
    { room: null, assigned: ownerId,   title: 'Order oyster spawn for next batch',     desc: 'Need 10 bags from BioSpore Finland — request quote first',            priority: 'medium',   status: 'in-progress', due: daysFrom(3) },
    // Pending
    { room: r0,   assigned: workerId,  title: 'Clean and disinfect Room A1 surfaces', desc: 'After harvest — bleach wash all walls and shelves',                   priority: 'medium',   status: 'pending',     due: daysFrom(2) },
    { room: null, assigned: workerId,  title: 'Refill humidifier water tanks',        desc: 'Check all 3 rooms — top up with distilled water',                     priority: 'low',      status: 'pending',     due: daysFrom(1) },
    { room: null, assigned: managerId, title: 'Inspect HVAC filters — all rooms',     desc: 'Monthly maintenance — replace if blocked',                            priority: 'medium',   status: 'pending',     due: daysFrom(7) },
    { room: r1,   assigned: workerId,  title: 'Inoculate Room B2 new substrate',      desc: 'Substrate is cooled and ready for shiitake spawn',                    priority: 'high',     status: 'pending',     due: daysFrom(4) },
    { room: null, assigned: managerId, title: 'Update SOP documentation',             desc: 'Revise contamination response procedures based on last month issues',  priority: 'low',      status: 'pending',     due: daysFrom(14) },
    // Completed
    { room: r0,   assigned: workerId,  title: 'Harvest Room A1 — Batch #046',         desc: 'Completed — 18.4 kg harvested, Grade A',                              priority: 'high',     status: 'completed',   due: daysAgo(5) },
    { room: r2,   assigned: workerId,  title: 'Deep clean Room C3 after contamination',desc: 'Full bleach wash + UV treatment completed',                          priority: 'critical', status: 'completed',   due: daysAgo(2) },
    { room: null, assigned: managerId, title: 'Weekly inventory count',               desc: 'All items counted and logged in system',                              priority: 'low',      status: 'completed',   due: daysAgo(1) },
  ]

  for (const t of tasks) {
    await pool.query(
      `INSERT INTO tasks (farm_id, room_id, assigned_to, title, description, priority, status, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [farmId, t.room, t.assigned, t.title, t.desc, t.priority, t.status, t.due]
    )
  }
  console.log(`   ✅ ${tasks.length} tasks added`)

  // ── Harvest logs ──────────────────────────────────────────────────────────
  console.log('🌾 Seeding harvest logs...')
  const harvests = [
    // Today
    { room: r0, species: 'Pleurotus ostreatus', weight: 4.2,  quality: 'A', notes: 'First flush, excellent pinning', days: 0 },
    // Recent
    { room: r1, species: 'Lentinula edodes',    weight: 6.8,  quality: 'A', notes: 'Good shiitake yield this cycle', days: 2 },
    { room: r0, species: 'Pleurotus ostreatus', weight: 18.4, quality: 'A', notes: 'Full harvest, 3 flushes total',  days: 5 },
    { room: r2, species: 'Agaricus bisporus',   weight: 3.1,  quality: 'B', notes: 'Partial harvest — contamination affected yield', days: 7 },
    { room: r1, species: 'Lentinula edodes',    weight: 12.5, quality: 'A', notes: 'Strong second flush',            days: 10 },
    { room: r0, species: 'Pleurotus ostreatus', weight: 7.2,  quality: 'A', notes: 'Second flush harvest',           days: 11 },
    { room: r0, species: 'Pleurotus ostreatus', weight: 9.1,  quality: 'B', notes: 'Third flush, some deformity',    days: 14 },
    { room: r2, species: 'Agaricus bisporus',   weight: 15.6, quality: 'A', notes: 'Best button mushroom yield this quarter', days: 18 },
    { room: r1, species: 'Lentinula edodes',    weight: 8.3,  quality: 'A', notes: 'Consistent yield',               days: 20 },
    { room: r0, species: 'Pleurotus ostreatus', weight: 11.2, quality: 'A', notes: 'Oyster flush — sold to restaurant', days: 24 },
    { room: r2, species: 'Agaricus bisporus',   weight: 9.8,  quality: 'B', notes: 'Second flush, acceptable quality', days: 27 },
    { room: r0, species: 'Pleurotus ostreatus', weight: 5.5,  quality: 'C', notes: 'Third flush — lower grade, local market', days: 30 },
  ]

  for (const h of harvests) {
    if (!h.room) continue
    const harvestDate = new Date(today)
    harvestDate.setDate(harvestDate.getDate() - h.days)
    await pool.query(
      `INSERT INTO harvest_logs (room_id, date, weight, quality, species, notes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [h.room, harvestDate.toISOString().split('T')[0], h.weight, h.quality, h.species, h.notes]
    )
  }
  console.log(`   ✅ ${harvests.length} harvest logs added`)

  // ── Sensor history (24h of readings for charts) ────────────────────────────
  console.log('📡 Seeding sensor history...')
  const baseReadings = [
    { temp: 21.2, humidity: 89.5, co2: 820,  light: 450, moisture: 72 },
    { temp: 22.8, humidity: 78.3, co2: 1150, light: 380, moisture: 65 },
    { temp: 26.4, humidity: 82.1, co2: 1680, light: 510, moisture: 58 },
  ]

  let sensorCount = 0
  for (let i = 0; i < rooms.length; i++) {
    const base = baseReadings[i] || baseReadings[0]
    // 48 readings = 1 per 30 min over 24h
    for (let h = 48; h >= 1; h--) {
      const ts = new Date(today.getTime() - h * 30 * 60 * 1000)
      const jitter = (range) => (Math.random() - 0.5) * range
      await pool.query(
        `INSERT INTO sensor_data (room_id, temperature, humidity, co2, light, moisture, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          rooms[i].id,
          parseFloat((base.temp     + jitter(2.0)).toFixed(1)),
          parseFloat((base.humidity + jitter(6.0)).toFixed(1)),
          Math.round(base.co2       + jitter(200)),
          Math.round(base.light     + jitter(80)),
          parseFloat((base.moisture + jitter(3.0)).toFixed(1)),
          ts.toISOString(),
        ]
      )
      sensorCount++
    }
  }
  console.log(`   ✅ ${sensorCount} sensor readings added (24h history per room)`)

  // ── Additional inventory items ─────────────────────────────────────────────
  console.log('📦 Seeding inventory...')
  const extraItems = [
    // Low stock / critical to trigger warnings
    { name: 'Shiitake Mushroom Spores',    cat: 'Biological', qty: 1,   unit: 'bags',    min: 3,  cost: 75,  supplier: 'BioSpore Finland' },
    { name: 'Lion\'s Mane Spawn',          cat: 'Biological', qty: 0,   unit: 'bags',    min: 2,  cost: 85,  supplier: 'Nordic Mushroom Lab' },
    { name: 'Oak Sawdust Blocks',          cat: 'Substrate',  qty: 8,   unit: 'blocks',  min: 10, cost: 12,  supplier: 'AgriSupply Oy' },
    { name: 'Brown Rice Flour',            cat: 'Substrate',  qty: 4,   unit: 'kg',      min: 5,  cost: 3.5, supplier: 'AgriSupply Oy' },
    { name: 'Isopropyl Alcohol 70%',       cat: 'Chemical',   qty: 6,   unit: 'liters',  min: 4,  cost: 8,   supplier: 'ChemClean Pro' },
    { name: 'Calcium Carbonate (CaCO₃)',   cat: 'Chemical',   qty: 2,   unit: 'kg',      min: 5,  cost: 6,   supplier: 'ChemClean Pro' },
    { name: 'Polypropylene Filter Discs',  cat: 'Supplies',   qty: 120, unit: 'pieces',  min: 50, cost: 0.3, supplier: 'PackRight' },
    { name: 'Mushroom Packaging Boxes',    cat: 'Supplies',   qty: 45,  unit: 'boxes',   min: 30, cost: 1.2, supplier: 'PackRight' },
    { name: 'Digital Hygrometer',          cat: 'Equipment',  qty: 2,   unit: 'units',   min: 1,  cost: 35,  supplier: 'SensorTech Oy' },
    { name: 'CO₂ Sensor Replacement Module',cat: 'Equipment', qty: 1,   unit: 'units',   min: 2,  cost: 120, supplier: 'SensorTech Oy' },
    { name: 'HEPA Filter (Room-size)',     cat: 'Equipment',  qty: 3,   unit: 'units',   min: 2,  cost: 65,  supplier: 'AirPure Nordic' },
  ]

  for (const it of extraItems) {
    await pool.query(
      `INSERT INTO inventory (farm_id, name, category, quantity, unit, min_quantity, cost, supplier)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [farmId, it.name, it.cat, it.qty, it.unit, it.min, it.cost, it.supplier]
    )
  }
  console.log(`   ✅ ${extraItems.length} inventory items added`)

  // ── More alerts ────────────────────────────────────────────────────────────
  console.log('🔔 Seeding alerts...')
  const extraAlerts = [
    { room: r0, msg: 'Temperature spike detected in Room A1 (24.1°C > 23°C)',        sev: 'warning',  type: 'threshold', ack: false, ago: 1 },
    { room: r1, msg: 'Humidifier offline in Room B2 — manual check required',         sev: 'critical', type: 'device',    ack: false, ago: 2 },
    { room: r2, msg: 'CO₂ normalizing in Room C3 after fan activation (1480 ppm)',    sev: 'info',     type: 'automation',ack: true,  ago: 3 },
    { room: r0, msg: 'Harvest reminder: Room A1 Batch #047 reaches peak in 1 day',    sev: 'info',     type: 'system',    ack: false, ago: 4 },
    { room: null,msg: 'Weekly system health check — all sensors reporting normally',   sev: 'info',     type: 'system',    ack: true,  ago: 5 },
    { room: r2, msg: 'Moisture sensor calibration drift detected in Room C3',          sev: 'warning',  type: 'device',    ack: true,  ago: 6 },
    { room: r1, msg: 'Automation rule "Humidity Control" triggered for Room B2',       sev: 'info',     type: 'automation',ack: true,  ago: 8 },
  ]

  for (const a of extraAlerts) {
    const ts = new Date(today.getTime() - a.ago * 60 * 60 * 1000)
    await pool.query(
      `INSERT INTO alerts (farm_id, room_id, message, severity, type, acknowledged, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [farmId, a.room, a.msg, a.sev, a.type, a.ack, ts.toISOString()]
    )
  }
  console.log(`   ✅ ${extraAlerts.length} alerts added`)

  await pool.end()

  console.log(`
🍄 Demo data seeded successfully!
   Tasks:           ${tasks.length} (overdue, in-progress, pending, completed)
   Harvest logs:    ${harvests.length} (last 30 days, 3 rooms)
   Sensor history:  ${sensorCount} readings (24h per room, for charts)
   Inventory:       ${extraItems.length} extra items (some low/out of stock)
   Alerts:          ${extraAlerts.length} extra (mix of severity + acknowledged)

   To remove all demo data:  node db/clear-demo.js
  `)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
