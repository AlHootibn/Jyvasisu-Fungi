import { Thermometer, Droplets, Wind, Sun, Sprout } from 'lucide-react'
import clsx from 'clsx'
import { getSensorStatus, SENSOR_THRESHOLDS } from '../../data/mockData'

const ICONS = {
  temp: Thermometer,
  humidity: Droplets,
  co2: Wind,
  light: Sun,
  moisture: Sprout,
}

const LABELS = {
  temp: 'Temperature',
  humidity: 'Humidity',
  co2: 'CO₂ Level',
  light: 'Light',
  moisture: 'Substrate Moisture',
}

export default function SensorCard({ type, value, roomName, compact }) {
  const status = getSensorStatus(type, value)
  const threshold = SENSOR_THRESHOLDS[type]
  const Icon = ICONS[type] || Wind
  const pct = threshold ? Math.min(100, Math.max(0, ((value - threshold.min) / (threshold.max - threshold.min)) * 100)) : 50

  const statusColors = {
    optimal: { bg: 'from-farm-900/30 to-transparent', border: 'border-farm-800/50', text: 'text-farm-400', bar: 'bg-farm-500' },
    warning: { bg: 'from-amber-900/30 to-transparent', border: 'border-amber-800/50', text: 'text-amber-400', bar: 'bg-amber-500' },
    critical: { bg: 'from-red-900/30 to-transparent', border: 'border-red-800/50', text: 'text-red-400', bar: 'bg-red-500' },
  }
  const c = statusColors[status]

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r', c.bg, c.border)}>
        <Icon size={16} className={c.text} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-400 truncate">{LABELS[type]}</p>
          <p className={clsx('text-sm font-bold tabular-nums', c.text)}>
            {value}{threshold?.unit}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('card bg-gradient-to-br', c.bg, 'border', c.border, 'relative overflow-hidden')}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{LABELS[type]}</p>
          {roomName && <p className="text-[11px] text-slate-500">{roomName}</p>}
        </div>
        <div className={clsx('p-2 rounded-lg', status === 'optimal' ? 'bg-farm-900/50' : status === 'warning' ? 'bg-amber-900/50' : 'bg-red-900/50')}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className={clsx('text-3xl font-bold tabular-nums', c.text)}>{value}</span>
        <span className="text-sm text-slate-400 mb-1">{threshold?.unit}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{threshold?.min}{threshold?.unit}</span>
          <span className={clsx('font-medium capitalize', c.text)}>{status}</span>
          <span>{threshold?.max}{threshold?.unit}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full transition-all duration-700', c.bar)} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-slate-500">
          Optimal: {threshold?.optimal.min}–{threshold?.optimal.max}{threshold?.unit}
        </p>
      </div>
    </div>
  )
}
