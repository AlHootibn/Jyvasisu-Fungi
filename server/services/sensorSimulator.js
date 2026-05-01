// Simulates IoT sensor readings every 3 seconds
// Replace this with real ESP32 data once hardware is connected

const db = require('../config/db')

async function tick(broadcast) {
  try {
    const { rows: rooms } = await db.query('SELECT id FROM rooms')
    for (const room of rooms) {
      const { rows: latest } = await db.query(
        `SELECT temperature, humidity, co2, light, moisture
         FROM sensor_data WHERE room_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [room.id]
      )
      const b = latest[0] || { temperature: 21, humidity: 88, co2: 850, light: 400, moisture: 70 }

      const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
      const reading = {
        temperature: parseFloat(clamp(b.temperature + (Math.random() - 0.5) * 0.4, 10, 40).toFixed(1)),
        humidity:    parseFloat(clamp(b.humidity    + (Math.random() - 0.5) * 1.2, 0, 100).toFixed(1)),
        co2:         Math.round(clamp(b.co2         + (Math.random() - 0.5) * 30,  300, 5000)),
        light:       Math.round(clamp(b.light       + (Math.random() - 0.5) * 20,  0, 2000)),
        moisture:    parseFloat(clamp(b.moisture    + (Math.random() - 0.5) * 0.5, 0, 100).toFixed(1)),
      }

      await db.query(
        `INSERT INTO sensor_data (room_id, temperature, humidity, co2, light, moisture)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [room.id, reading.temperature, reading.humidity, reading.co2, reading.light, reading.moisture]
      )

      if (broadcast) {
        broadcast({
          type: 'sensor_update',
          roomId: room.id,
          data: {
            temp:     reading.temperature,
            humidity: reading.humidity,
            co2:      reading.co2,
            light:    reading.light,
            moisture: reading.moisture,
          }
        })
      }
    }
  } catch (err) {
    console.error('Sensor simulator error:', err.message)
  }
}

function startSensorSimulator(broadcast) {
  console.log('📡 Sensor simulator started (3s interval)')
  setInterval(() => tick(broadcast), 3000)
}

module.exports = { startSensorSimulator }
