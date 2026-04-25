// Automation Engine
// Runs every 10 seconds, checks sensor readings against rules, triggers devices, creates alerts

const db = require('../config/db')

const SENSOR_MAP = {
  temp:     'temperature',
  humidity: 'humidity',
  co2:      'co2',
  light:    'light',
  moisture: 'moisture',
}

function evaluate(actual, operator, threshold) {
  switch (operator) {
    case '<':  return actual <  threshold
    case '>':  return actual >  threshold
    case '<=': return actual <= threshold
    case '>=': return actual >= threshold
    case '=':  return actual === threshold
    default:   return false
  }
}

async function runAutomation(broadcast) {
  try {
    // Get active rules
    const { rows: rules } = await db.query(
      `SELECT * FROM automation_rules WHERE is_active = true ORDER BY priority`
    )
    if (!rules.length) return

    // Get latest sensor reading per room
    const { rows: sensors } = await db.query(`
      SELECT DISTINCT ON (room_id)
        room_id, temperature, humidity, co2, light, moisture
      FROM sensor_data
      ORDER BY room_id, created_at DESC
    `)

    const sensorByRoom = {}
    for (const s of sensors) sensorByRoom[s.room_id] = s

    for (const rule of rules) {
      // room_id=null means applies to all rooms
      const rooms = rule.room_id
        ? [{ room_id: rule.room_id }]
        : sensors.map(s => ({ room_id: s.room_id }))

      for (const { room_id } of rooms) {
        const reading = sensorByRoom[room_id]
        if (!reading) continue

        const dbCol  = SENSOR_MAP[rule.condition_sensor]
        const actual = parseFloat(reading[dbCol])
        if (isNaN(actual)) continue

        const triggered = evaluate(actual, rule.operator, parseFloat(rule.condition_value))

        // Find devices of this type in the room
        const { rows: devices } = await db.query(
          `SELECT id, status FROM devices WHERE room_id=$1 AND type=$2`,
          [room_id, rule.action_device]
        )

        for (const device of devices) {
          const targetStatus = triggered ? rule.action_state : (rule.action_state === 'on' ? 'off' : 'on')
          if (device.status !== targetStatus) {
            await db.query(
              `UPDATE devices SET status=$1, mode='auto' WHERE id=$2`,
              [targetStatus, device.id]
            )
            // Broadcast device state change
            if (broadcast) {
              broadcast({ type: 'device_update', deviceId: device.id, status: targetStatus, mode: 'auto' })
            }
          }
        }

        // Create alert if threshold crossed (avoid duplicates — check last 5 min)
        if (triggered) {
          const { rows: recent } = await db.query(
            `SELECT id FROM alerts
             WHERE room_id=$1 AND message LIKE $2 AND created_at > NOW() - INTERVAL '5 minutes'`,
            [room_id, `%${rule.name}%`]
          )
          if (!recent.length) {
            const severity = rule.condition_sensor === 'co2' || rule.condition_sensor === 'temp'
              ? 'critical' : 'warning'
            const { rows: alert } = await db.query(
              `INSERT INTO alerts (farm_id, room_id, message, severity, type)
               VALUES ((SELECT farm_id FROM rooms WHERE id=$1), $1, $2, $3, 'automation') RETURNING *`,
              [room_id, `[${rule.name}] ${rule.condition_sensor} ${rule.operator} ${rule.condition_value} — ${rule.action_device} turned ${rule.action_state.toUpperCase()}`, severity]
            )
            if (broadcast && alert[0]) {
              broadcast({ type: 'new_alert', alert: alert[0] })
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Automation engine error:', err.message)
  }
}

function startAutomationEngine(broadcast) {
  console.log('⚙️  Automation engine started (10s interval)')
  setInterval(() => runAutomation(broadcast), 10000)
}

module.exports = { startAutomationEngine }
