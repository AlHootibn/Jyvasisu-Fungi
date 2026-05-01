import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { generateSensorHistory, SENSOR_THRESHOLDS } from '../../data/mockData'
import { useMemo } from 'react'

const COLORS = { temp: '#f97316', humidity: '#3b82f6', co2: '#a855f7', light: '#eab308', moisture: '#10b981' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function SensorLineChart({ type, currentValue, height = 200, data: propData }) {
  const data = useMemo(
    () => propData ?? generateSensorHistory(currentValue, 24, SENSOR_THRESHOLDS[type]?.optimal ? 2 : 1),
    [propData, currentValue]
  )
  const t = SENSOR_THRESHOLDS[type]
  const color = COLORS[type] || '#22c55e'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={3} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} domain={[t?.min ?? 'auto', t?.max ?? 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        {t && <ReferenceLine y={t.optimal.min} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.4} />}
        {t && <ReferenceLine y={t.optimal.max} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.4} />}
        <Line type="monotone" dataKey="value" name={t?.label || type} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
