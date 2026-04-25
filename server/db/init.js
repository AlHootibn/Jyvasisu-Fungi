// Run: node db/init.js
// Creates tables and seeds demo data

require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

async function init() {
  // Connect to postgres to create database if needed
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  })

  const dbName = process.env.DB_NAME || 'jyvasisu_fungi'

  try {
    const exists = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    )
    if (exists.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✅ Database "${dbName}" created`)
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`)
    }
  } finally {
    await adminPool.end()
  }

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  })

  // Enable pgcrypto for gen_random_bytes
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`).catch(() => {})

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✅ Schema applied')

  // Seed users
  const users = [
    { name: 'Hisham AlHoot',  email: 'admin@farm.com',   password: 'admin123',   role: 'Super Admin',  avatar: 'HA' },
    { name: 'Sara Al-Rashid', email: 'owner@farm.com',   password: 'owner123',   role: 'Farm Owner',   avatar: 'SR' },
    { name: 'Omar Khalid',    email: 'manager@farm.com', password: 'manager123', role: 'Farm Manager', avatar: 'OK' },
    { name: 'Laila Nasser',   email: 'worker@farm.com',  password: 'worker123',  role: 'Worker',       avatar: 'LN' },
    { name: 'Investor View',  email: 'viewer@farm.com',  password: 'viewer123',  role: 'Viewer',       avatar: 'IV' },
  ]

  let farmOwnerId
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10)
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, avatar)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
      [u.name, u.email, hash, u.role, u.avatar]
    )
    if (u.role === 'Farm Owner') farmOwnerId = res.rows[0].id
    if (u.role === 'Super Admin' && !farmOwnerId) farmOwnerId = res.rows[0].id
  }
  console.log('✅ Users seeded')

  // Seed farm
  const farmRes = await pool.query(
    `INSERT INTO farms (name, location, area, description, established, owner_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT DO NOTHING RETURNING id`,
    ['JyväSisu Fungi', 'Jyväskylä, Finland', '500 m²',
     'Primary production facility specializing in gourmet mushrooms',
     '2023-01-15', farmOwnerId, 'active']
  )

  let farmId
  if (farmRes.rowCount > 0) {
    farmId = farmRes.rows[0].id
  } else {
    const f = await pool.query(`SELECT id FROM farms LIMIT 1`)
    farmId = f.rows[0].id
  }
  console.log('✅ Farm seeded')

  // Seed rooms
  const rooms = [
    { name: 'Room A1', type: 'Oyster Mushrooms', species: 'Pleurotus ostreatus', capacity: '200 bags', status: 'optimal', batch: 'Batch #047', start: '2026-04-10', harvest: '2026-04-30' },
    { name: 'Room B2', type: 'Shiitake Mushrooms', species: 'Lentinula edodes',   capacity: '150 bags', status: 'warning',  batch: 'Batch #045', start: '2026-04-05', harvest: '2026-04-28' },
    { name: 'Room C3', type: 'Button Mushrooms',   species: 'Agaricus bisporus',  capacity: '300 bags', status: 'critical', batch: 'Batch #043', start: '2026-03-28', harvest: '2026-04-25' },
  ]

  const roomIds = []
  for (const r of rooms) {
    const res = await pool.query(
      `INSERT INTO rooms (farm_id, name, type, species, capacity, status, current_batch, batch_start_date, expected_harvest)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [farmId, r.name, r.type, r.species, r.capacity, r.status, r.batch, r.start, r.harvest]
    )
    roomIds.push(res.rows[0].id)
  }
  console.log('✅ Rooms seeded')

  // Seed devices
  const deviceTypes = ['humidifier', 'fan', 'heater', 'lights', 'pump']
  const devicePowers = { humidifier: 150, fan: 80, heater: 500, lights: 200, pump: 60 }
  for (const roomId of roomIds) {
    for (const type of deviceTypes) {
      const roomIndex = roomIds.indexOf(roomId)
      const status = (type === 'lights' || (type === 'humidifier' && roomIndex > 0)) ? 'on' : 'off'
      await pool.query(
        `INSERT INTO devices (room_id, name, type, status, mode, power)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [roomId, `${type.charAt(0).toUpperCase() + type.slice(1)} ${rooms[roomIds.indexOf(roomId)].name}`,
         type, status, type === 'lights' ? 'scheduled' : 'auto', devicePowers[type]]
      )
    }
  }
  console.log('✅ Devices seeded')

  // Seed initial sensor data
  const initialSensors = [
    { temp: 21.2, humidity: 89.5, co2: 820,  light: 450, moisture: 72 },
    { temp: 22.8, humidity: 78.3, co2: 1150, light: 380, moisture: 65 },
    { temp: 26.4, humidity: 82.1, co2: 1680, light: 510, moisture: 58 },
  ]
  for (let i = 0; i < roomIds.length; i++) {
    const s = initialSensors[i]
    await pool.query(
      `INSERT INTO sensor_data (room_id, temperature, humidity, co2, light, moisture)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [roomIds[i], s.temp, s.humidity, s.co2, s.light, s.moisture]
    )
  }
  console.log('✅ Sensor data seeded')

  // Seed automation rules
  const rules = [
    { name: 'Humidity Control',    sensor: 'humidity', op: '<',  val: 85,   device: 'humidifier', state: 'on',  desc: 'Turn ON humidifier when humidity drops below 85%' },
    { name: 'Temperature Cooling', sensor: 'temp',     op: '>',  val: 25,   device: 'fan',        state: 'on',  desc: 'Turn ON fan when temperature exceeds 25°C' },
    { name: 'CO₂ Ventilation',     sensor: 'co2',      op: '>',  val: 1500, device: 'fan',        state: 'on',  desc: 'Activate exhaust fan when CO₂ exceeds 1500 ppm' },
    { name: 'Over-Humidity Guard', sensor: 'humidity', op: '>',  val: 96,   device: 'fan',        state: 'on',  desc: 'Run fan to reduce over-saturation above 96%' },
    { name: 'Cold Protection',     sensor: 'temp',     op: '<',  val: 16,   device: 'heater',     state: 'on',  desc: 'Activate heater if temperature drops below 16°C' },
  ]
  for (const r of rules) {
    await pool.query(
      `INSERT INTO automation_rules (farm_id, name, description, condition_sensor, operator, condition_value, action_device, action_state, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [farmId, r.name, r.desc, r.sensor, r.op, r.val, r.device, r.state, true]
    )
  }
  console.log('✅ Automation rules seeded')

  // Seed alerts
  await pool.query(
    `INSERT INTO alerts (farm_id, room_id, message, severity, type, acknowledged)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [farmId, roomIds[2], 'CO₂ level critical in Room C3 (1680 ppm > 1500 ppm)', 'critical', 'threshold', false]
  )
  await pool.query(
    `INSERT INTO alerts (farm_id, room_id, message, severity, type, acknowledged)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [farmId, roomIds[1], 'Humidity below target in Room B2 (78.3% < 80%)', 'warning', 'threshold', false]
  )
  console.log('✅ Alerts seeded')

  // Seed inventory
  const items = [
    { name: 'Oyster Mushroom Spores', cat: 'Biological', qty: 5,  unit: 'bags',   min: 2,  cost: 45,  supplier: 'BioSpore Finland' },
    { name: 'Shiitake Spawn',         cat: 'Biological', qty: 3,  unit: 'bags',   min: 2,  cost: 65,  supplier: 'BioSpore Finland' },
    { name: 'Pasteurized Straw',      cat: 'Substrate',  qty: 12, unit: 'bales',  min: 5,  cost: 25,  supplier: 'AgriSupply Oy' },
    { name: 'Hydrogen Peroxide H₂O₂', cat: 'Chemical',  qty: 2,  unit: 'liters', min: 5,  cost: 18,  supplier: 'ChemClean Pro' },
    { name: 'Sterilization Bags (PP)',cat: 'Supplies',   qty: 50, unit: 'pieces', min: 20, cost: 0.5, supplier: 'PackRight' },
  ]
  for (const it of items) {
    await pool.query(
      `INSERT INTO inventory (farm_id, name, category, quantity, unit, min_quantity, cost, supplier)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [farmId, it.name, it.cat, it.qty, it.unit, it.min, it.cost, it.supplier]
    )
  }
  console.log('✅ Inventory seeded')

  await pool.end()
  console.log('\n🍄 Database initialised successfully!')
  console.log('   Demo credentials:')
  console.log('   admin@farm.com / admin123  (Super Admin)')
  console.log('   manager@farm.com / manager123  (Farm Manager)')
  console.log('   worker@farm.com / worker123  (Worker)\n')
}

init().catch(err => {
  console.error('❌ Init failed:', err.message)
  process.exit(1)
})
