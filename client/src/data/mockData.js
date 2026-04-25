import { subDays, subHours, subMinutes, format } from 'date-fns'

export const DEMO_USERS = [
  { id: 1, name: 'Hisham AlHoot', email: 'admin@farm.com', password: 'admin123', role: 'Super Admin', avatar: 'HA', lastLogin: new Date().toISOString() },
  { id: 2, name: 'Sara Al-Rashid', email: 'owner@farm.com', password: 'owner123', role: 'Farm Owner', avatar: 'SR', lastLogin: subHours(new Date(), 3).toISOString() },
  { id: 3, name: 'Omar Khalid', email: 'manager@farm.com', password: 'manager123', role: 'Farm Manager', avatar: 'OK', lastLogin: subHours(new Date(), 6).toISOString() },
  { id: 4, name: 'Laila Nasser', email: 'worker@farm.com', password: 'worker123', role: 'Worker', avatar: 'LN', lastLogin: subDays(new Date(), 1).toISOString() },
  { id: 5, name: 'Investor View', email: 'viewer@farm.com', password: 'viewer123', role: 'Viewer', avatar: 'IV', lastLogin: subDays(new Date(), 2).toISOString() },
]

export const INITIAL_FARMS = [
  {
    id: 1,
    name: 'JyväSisu Fungi',
    location: 'Jyväskylä, Finland',
    area: '500 m²',
    established: '2023-01-15',
    status: 'active',
    description: 'Primary production facility specializing in gourmet mushrooms',
    totalRooms: 3,
    activeAlerts: 2,
  }
]

export const INITIAL_ROOMS = [
  { id: 1, farmId: 1, name: 'Room A1', type: 'Oyster Mushrooms', species: 'Pleurotus ostreatus', status: 'optimal', capacity: '200 bags', currentBatch: 'Batch #047', batchStartDate: '2026-04-10', expectedHarvest: '2026-04-30' },
  { id: 2, farmId: 1, name: 'Room B2', type: 'Shiitake Mushrooms', species: 'Lentinula edodes', status: 'warning', capacity: '150 bags', currentBatch: 'Batch #045', batchStartDate: '2026-04-05', expectedHarvest: '2026-04-28' },
  { id: 3, farmId: 1, name: 'Room C3', type: 'Button Mushrooms', species: 'Agaricus bisporus', status: 'critical', capacity: '300 bags', currentBatch: 'Batch #043', batchStartDate: '2026-03-28', expectedHarvest: '2026-04-25' },
]

export const INITIAL_SENSORS = {
  1: { temp: 21.2, humidity: 89.5, co2: 820, light: 450, moisture: 72 },
  2: { temp: 22.8, humidity: 78.3, co2: 1150, light: 380, moisture: 65 },
  3: { temp: 26.4, humidity: 82.1, co2: 1680, light: 510, moisture: 58 },
}

export const INITIAL_DEVICES = [
  { id: 1, roomId: 1, name: 'Humidifier A1', type: 'humidifier', status: 'off', mode: 'auto', power: 150 },
  { id: 2, roomId: 1, name: 'Fan A1', type: 'fan', status: 'off', mode: 'auto', power: 80 },
  { id: 3, roomId: 1, name: 'Heater A1', type: 'heater', status: 'off', mode: 'auto', power: 500 },
  { id: 4, roomId: 1, name: 'LED Lights A1', type: 'lights', status: 'on', mode: 'scheduled', power: 200 },
  { id: 5, roomId: 1, name: 'Mist Pump A1', type: 'pump', status: 'off', mode: 'auto', power: 60 },
  { id: 6, roomId: 2, name: 'Humidifier B2', type: 'humidifier', status: 'on', mode: 'auto', power: 150 },
  { id: 7, roomId: 2, name: 'Fan B2', type: 'fan', status: 'off', mode: 'auto', power: 80 },
  { id: 8, roomId: 2, name: 'Heater B2', type: 'heater', status: 'off', mode: 'manual', power: 500 },
  { id: 9, roomId: 2, name: 'LED Lights B2', type: 'lights', status: 'on', mode: 'scheduled', power: 200 },
  { id: 10, roomId: 2, name: 'Mist Pump B2', type: 'pump', status: 'on', mode: 'auto', power: 60 },
  { id: 11, roomId: 3, name: 'Humidifier C3', type: 'humidifier', status: 'on', mode: 'auto', power: 150 },
  { id: 12, roomId: 3, name: 'Fan C3', type: 'fan', status: 'on', mode: 'auto', power: 80 },
  { id: 13, roomId: 3, name: 'Heater C3', type: 'heater', status: 'off', mode: 'auto', power: 500 },
  { id: 14, roomId: 3, name: 'LED Lights C3', type: 'lights', status: 'on', mode: 'scheduled', power: 200 },
  { id: 15, roomId: 3, name: 'Exhaust Fan C3', type: 'fan', status: 'on', mode: 'auto', power: 120 },
]

export const INITIAL_ALERTS = [
  { id: 1, severity: 'critical', type: 'threshold', message: 'CO₂ level critical in Room C3 (1680 ppm > 1500 ppm)', roomId: 3, roomName: 'Room C3', timestamp: subHours(new Date(), 2).toISOString(), acknowledged: false },
  { id: 2, severity: 'critical', type: 'threshold', message: 'Temperature too high in Room C3 (26.4°C > 25°C)', roomId: 3, roomName: 'Room C3', timestamp: subHours(new Date(), 2.5).toISOString(), acknowledged: false },
  { id: 3, severity: 'warning', type: 'threshold', message: 'Humidity below target in Room B2 (78.3% < 80%)', roomId: 2, roomName: 'Room B2', timestamp: subHours(new Date(), 4).toISOString(), acknowledged: false },
  { id: 4, severity: 'warning', type: 'threshold', message: 'CO₂ rising in Room B2 (1150 ppm)', roomId: 2, roomName: 'Room B2', timestamp: subHours(new Date(), 5).toISOString(), acknowledged: true },
  { id: 5, severity: 'info', type: 'system', message: 'Humidifier B2 auto-activated — humidity threshold reached', roomId: 2, roomName: 'Room B2', timestamp: subHours(new Date(), 5).toISOString(), acknowledged: true },
  { id: 6, severity: 'info', type: 'device', message: 'Batch #045 harvest window approaching (4 days remaining)', roomId: 2, roomName: 'Room B2', timestamp: subHours(new Date(), 8).toISOString(), acknowledged: true },
  { id: 7, severity: 'warning', type: 'device', message: 'Heater A1 last maintenance overdue (30+ days)', roomId: 1, roomName: 'Room A1', timestamp: subDays(new Date(), 2).toISOString(), acknowledged: true },
  { id: 8, severity: 'info', type: 'system', message: 'System backup completed successfully', roomId: null, roomName: 'System', timestamp: subDays(new Date(), 1).toISOString(), acknowledged: true },
]

export const INITIAL_TASKS = [
  { id: 1, title: 'Clean misting nozzles — Room A1', description: 'Remove and clean all misting nozzles in Room A1 to prevent clogging', assignedTo: 4, priority: 'high', status: 'pending', dueDate: format(new Date(), 'yyyy-MM-dd'), roomId: 1 },
  { id: 2, title: 'Check substrate moisture levels', description: 'Manual check of substrate moisture in all rooms and log readings', assignedTo: 4, priority: 'medium', status: 'completed', dueDate: format(new Date(), 'yyyy-MM-dd'), roomId: null },
  { id: 3, title: 'Harvest inspection — Room B2', description: 'Inspect mushroom growth stage and prepare for partial harvest', assignedTo: 3, priority: 'high', status: 'in-progress', dueDate: format(subDays(new Date(), -1), 'yyyy-MM-dd'), roomId: 2 },
  { id: 4, title: 'Weekly equipment sanitization', description: 'Full sanitization of all tools and equipment used in harvesting', assignedTo: 4, priority: 'medium', status: 'pending', dueDate: format(subDays(new Date(), -2), 'yyyy-MM-dd'), roomId: null },
  { id: 5, title: 'Restock hydrogen peroxide', description: 'Order and restock hydrogen peroxide (current level critically low)', assignedTo: 2, priority: 'critical', status: 'pending', dueDate: format(new Date(), 'yyyy-MM-dd'), roomId: null },
  { id: 6, title: 'CO₂ sensor calibration — Room C3', description: 'Calibrate CO₂ sensor in Room C3, readings may be inaccurate', assignedTo: 3, priority: 'high', status: 'pending', dueDate: format(subDays(new Date(), -1), 'yyyy-MM-dd'), roomId: 3 },
  { id: 7, title: 'Prepare new substrate bags', description: 'Prepare 100 bags of pasteurized straw substrate for next batch', assignedTo: 4, priority: 'low', status: 'pending', dueDate: format(subDays(new Date(), -3), 'yyyy-MM-dd'), roomId: null },
  { id: 8, title: 'Update harvest log — Room C3', description: 'Record final weights and quality notes for Batch #043', assignedTo: 3, priority: 'medium', status: 'completed', dueDate: format(subDays(new Date(), -1), 'yyyy-MM-dd'), roomId: 3 },
]

export const INITIAL_INVENTORY = [
  { id: 1, name: 'Oyster Mushroom Spores', category: 'Biological', quantity: 5, unit: 'bags', minQuantity: 2, cost: 45, supplier: 'BioSpore Arabia', lastRestocked: subDays(new Date(), 10).toISOString() },
  { id: 2, name: 'Shiitake Spawn', category: 'Biological', quantity: 3, unit: 'bags', minQuantity: 2, cost: 65, supplier: 'BioSpore Arabia', lastRestocked: subDays(new Date(), 15).toISOString() },
  { id: 3, name: 'Button Mushroom Casing', category: 'Biological', quantity: 8, unit: 'kg', minQuantity: 5, cost: 30, supplier: 'FungiFarm Supply', lastRestocked: subDays(new Date(), 5).toISOString() },
  { id: 4, name: 'Pasteurized Straw Substrate', category: 'Substrate', quantity: 12, unit: 'bales', minQuantity: 5, cost: 25, supplier: 'AgriSupply Co.', lastRestocked: subDays(new Date(), 3).toISOString() },
  { id: 5, name: 'Calcium Sulfate (Gypsum)', category: 'Substrate', quantity: 8, unit: 'kg', minQuantity: 3, cost: 12, supplier: 'AgriSupply Co.', lastRestocked: subDays(new Date(), 20).toISOString() },
  { id: 6, name: 'Hydrogen Peroxide (H₂O₂)', category: 'Chemical', quantity: 2, unit: 'liters', minQuantity: 5, cost: 18, supplier: 'ChemClean Pro', lastRestocked: subDays(new Date(), 25).toISOString() },
  { id: 7, name: 'Isopropyl Alcohol 70%', category: 'Chemical', quantity: 4, unit: 'liters', minQuantity: 3, cost: 15, supplier: 'ChemClean Pro', lastRestocked: subDays(new Date(), 12).toISOString() },
  { id: 8, name: 'Sterilization Bags (PP)', category: 'Supplies', quantity: 50, unit: 'pieces', minQuantity: 20, cost: 0.5, supplier: 'PackRight', lastRestocked: subDays(new Date(), 7).toISOString() },
  { id: 9, name: 'Harvest Crates', category: 'Equipment', quantity: 15, unit: 'pieces', minQuantity: 10, cost: 8, supplier: 'FarmEquip', lastRestocked: subDays(new Date(), 60).toISOString() },
  { id: 10, name: 'Filter Patches (0.2μm)', category: 'Supplies', quantity: 30, unit: 'pieces', minQuantity: 15, cost: 1.2, supplier: 'PackRight', lastRestocked: subDays(new Date(), 14).toISOString() },
]

export const INITIAL_HARVEST_LOGS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  roomId: (i % 3) + 1,
  roomName: ['Room A1', 'Room B2', 'Room C3'][i % 3],
  date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
  weight: parseFloat((2 + Math.random() * 3 + (i % 3 === 0 ? 1 : 0)).toFixed(2)),
  quality: ['A', 'A', 'A', 'B', 'A', 'B'][Math.floor(Math.random() * 6)],
  species: ['Oyster', 'Shiitake', 'Button'][i % 3],
  notes: i % 5 === 0 ? 'Excellent pin formation, uniform size' : i % 7 === 0 ? 'Slight discoloration on edges' : '',
}))

export const INITIAL_AUTOMATION_RULES = [
  { id: 1, name: 'Humidity Control', roomId: null, isActive: true, priority: 1, condition: { sensor: 'humidity', operator: '<', value: 85, unit: '%' }, action: { device: 'humidifier', state: 'on' }, description: 'Turn ON humidifier when humidity drops below 85%' },
  { id: 2, name: 'Temperature Cooling', roomId: null, isActive: true, priority: 1, condition: { sensor: 'temp', operator: '>', value: 25, unit: '°C' }, action: { device: 'fan', state: 'on' }, description: 'Turn ON ventilation fan when temperature exceeds 25°C' },
  { id: 3, name: 'CO₂ Ventilation', roomId: null, isActive: true, priority: 2, condition: { sensor: 'co2', operator: '>', value: 1500, unit: 'ppm' }, action: { device: 'fan', state: 'on' }, description: 'Activate exhaust fan when CO₂ exceeds 1500 ppm' },
  { id: 4, name: 'Night Light Schedule', roomId: null, isActive: true, priority: 3, condition: { sensor: 'time', operator: 'between', value: '22:00-06:00', unit: '' }, action: { device: 'lights', state: 'off' }, description: 'Turn OFF LED lights during night cycle (22:00–06:00)' },
  { id: 5, name: 'Cold Protection', roomId: null, isActive: false, priority: 2, condition: { sensor: 'temp', operator: '<', value: 16, unit: '°C' }, action: { device: 'heater', state: 'on' }, description: 'Activate heater if temperature drops below 16°C (Winter backup)' },
  { id: 6, name: 'Over-Humidity Alert', roomId: null, isActive: true, priority: 1, condition: { sensor: 'humidity', operator: '>', value: 96, unit: '%' }, action: { device: 'fan', state: 'on' }, description: 'Run fan to reduce over-saturation above 96%' },
]

export const SENSOR_THRESHOLDS = {
  temp: { min: 16, max: 25, optimal: { min: 18, max: 23 }, unit: '°C', label: 'Temperature' },
  humidity: { min: 75, max: 96, optimal: { min: 85, max: 95 }, unit: '%', label: 'Humidity' },
  co2: { min: 300, max: 1500, optimal: { min: 400, max: 1000 }, unit: 'ppm', label: 'CO₂' },
  light: { min: 0, max: 1000, optimal: { min: 200, max: 600 }, unit: 'lux', label: 'Light' },
  moisture: { min: 50, max: 90, optimal: { min: 60, max: 80 }, unit: '%', label: 'Moisture' },
}

export function getSensorStatus(type, value) {
  const t = SENSOR_THRESHOLDS[type]
  if (!t) return 'optimal'
  if (value < t.min || value > t.max) return 'critical'
  if (value >= t.optimal.min && value <= t.optimal.max) return 'optimal'
  return 'warning'
}

export function simulateSensorUpdate(sensors) {
  const updated = {}
  for (const roomId in sensors) {
    const s = sensors[roomId]
    updated[roomId] = {
      temp: parseFloat((s.temp + (Math.random() - 0.5) * 0.4).toFixed(1)),
      humidity: parseFloat((s.humidity + (Math.random() - 0.5) * 1.2).toFixed(1)),
      co2: Math.round(s.co2 + (Math.random() - 0.5) * 30),
      light: Math.round(s.light + (Math.random() - 0.5) * 20),
      moisture: parseFloat((s.moisture + (Math.random() - 0.5) * 0.5).toFixed(1)),
    }
  }
  return updated
}

export function generateSensorHistory(baseValue, points = 24, variance = 2) {
  return Array.from({ length: points }, (_, i) => ({
    time: format(subHours(new Date(), points - 1 - i), 'HH:mm'),
    value: parseFloat((baseValue + (Math.random() - 0.5) * variance * 2).toFixed(1)),
  }))
}
