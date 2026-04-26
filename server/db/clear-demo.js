// Removes all demo data added by seed-demo.js
// Keeps the core data (farm, rooms, devices, users, automation rules)
// Run: node db/clear-demo.js

require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jyvasisu_fungi',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

async function clear() {
  const { rows: farms } = await pool.query(`SELECT id FROM farms LIMIT 1`)
  if (!farms[0]) { console.error('❌ No farm found'); process.exit(1) }
  const farmId = farms[0].id

  // Tasks
  const { rowCount: tasks } = await pool.query(`DELETE FROM tasks WHERE farm_id=$1`, [farmId])
  console.log(`🗑  Deleted ${tasks} tasks`)

  // Harvest logs (no farm_id column — delete via room JOIN)
  const { rowCount: harvest } = await pool.query(`
    DELETE FROM harvest_logs
    WHERE room_id IN (SELECT id FROM rooms WHERE farm_id=$1)
  `, [farmId])
  console.log(`🗑  Deleted ${harvest} harvest logs`)

  // Sensor history (keep only the most recent reading per room)
  const { rowCount: sensors } = await pool.query(`
    DELETE FROM sensor_data
    WHERE id NOT IN (
      SELECT DISTINCT ON (room_id) id
      FROM sensor_data
      ORDER BY room_id, created_at DESC
    )
  `)
  console.log(`🗑  Deleted ${sensors} sensor history readings`)

  // Extra inventory (keep the 5 original items from init.js, delete the rest)
  const originalItems = [
    'Oyster Mushroom Spores',
    'Shiitake Spawn',
    'Pasteurized Straw',
    'Hydrogen Peroxide H₂O₂',
    'Sterilization Bags (PP)',
  ]
  const { rowCount: inv } = await pool.query(
    `DELETE FROM inventory WHERE farm_id=$1 AND name != ALL($2::text[])`,
    [farmId, originalItems]
  )
  console.log(`🗑  Deleted ${inv} extra inventory items`)

  // Alerts (delete everything, the automation engine will re-create real ones)
  const { rowCount: alerts } = await pool.query(`DELETE FROM alerts WHERE farm_id=$1`, [farmId])
  console.log(`🗑  Deleted ${alerts} alerts`)

  await pool.end()
  console.log('\n✅ Demo data cleared. Core data (farm, rooms, devices, users, rules) untouched.')
}

clear().catch(err => {
  console.error('❌ Clear failed:', err.message)
  process.exit(1)
})
