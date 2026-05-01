import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts'
import { format, subDays } from 'date-fns'
import { Download, TrendingUp, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import React from 'react'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  )
}

export default function Reports() {
  const { harvestLogs, sensors, farms } = useFarm()
  const [multiSensor, setMultiSensor] = useState([])
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    api.getSensorHistory(1, 24).then(readings => {
      setMultiSensor(readings.map(r => ({
        time: format(new Date(r.created_at), 'HH:mm'),
        Temp: parseFloat(r.temperature),
        Humidity: parseFloat(r.humidity),
      })))
    }).catch(() => {})
  }, [])

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    const day = format(subDays(new Date(), 6 - i), 'MMM d')
    const logs = harvestLogs.filter(h => h.date === date)
    return {
      day,
      'Room A1': logs.filter(h => h.roomId === 1).reduce((s, h) => s + h.weight, 0).toFixed(1),
      'Room B2': logs.filter(h => h.roomId === 2).reduce((s, h) => s + h.weight, 0).toFixed(1),
      'Room C3': logs.filter(h => h.roomId === 3).reduce((s, h) => s + h.weight, 0).toFixed(1),
    }
  })

  const totalHarvest = harvestLogs.reduce((s, h) => s + h.weight, 0)
  const avgDaily = (totalHarvest / 30).toFixed(1)
  const byRoom = [
    { name: 'Room A1', value: harvestLogs.filter(h => h.roomId === 1).reduce((s, h) => s + h.weight, 0).toFixed(1) },
    { name: 'Room B2', value: harvestLogs.filter(h => h.roomId === 2).reduce((s, h) => s + h.weight, 0).toFixed(1) },
    { name: 'Room C3', value: harvestLogs.filter(h => h.roomId === 3).reduce((s, h) => s + h.weight, 0).toFixed(1) },
  ]

  const handleExport = () => {
    const rows = harvestLogs.map(h => `${h.date},${h.roomName},${h.weight},${h.quality},${h.species}`)
    const csv = ['Date,Room,Weight(kg),Quality,Species', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'harvest_report.csv'; a.click()
  }

  const handlePdfExport = async () => {
    setPdfLoading(true)
    try {
      const [{ pdf }, { default: ReportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../components/ReportPDF'),
      ])
      const blob = await pdf(
        React.createElement(ReportPDF, { harvestLogs, sensors, farms })
      ).toBlob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `jyvasisu-fungi-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-5 max-w-screen-xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="card-sm text-center">
              <p className="text-xl font-bold text-farm-400">{totalHarvest.toFixed(1)} kg</p>
              <p className="text-[11px] text-slate-500">Total (30 days)</p>
            </div>
            <div className="card-sm text-center">
              <p className="text-xl font-bold text-blue-400">{avgDaily} kg</p>
              <p className="text-[11px] text-slate-500">Avg per day</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={15} /> CSV
            </button>
            <button
              onClick={handlePdfExport}
              disabled={pdfLoading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {pdfLoading
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FileText size={15} />}
              {pdfLoading ? 'Generating…' : 'Export PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 card">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Daily Harvest by Room (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} unit=" kg" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                {['Room A1', 'Room B2', 'Room C3'].map((k, i) => (
                  <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card flex flex-col">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Yield Distribution</h2>
            <div className="flex-1 flex items-center justify-center">
              <PieChart width={200} height={200}>
                <Pie data={byRoom} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                  {byRoom.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </div>
            <div className="space-y-1 mt-2">
              {byRoom.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400">{r.name}</span>
                  </span>
                  <span className="text-slate-300 font-medium">{r.value} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Temperature & Humidity — Room A1 (24h)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={multiSensor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} interval={3} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line yAxisId="left" type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="Humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">Recent Harvest Logs</h2>
            <TrendingUp size={16} className="text-farm-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Date', 'Room', 'Species', 'Weight', 'Quality', 'Notes'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {harvestLogs.slice(-15).reverse().map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="py-2 pr-4 text-slate-400 text-xs">{log.date}</td>
                    <td className="py-2 pr-4 text-slate-300">{log.roomName}</td>
                    <td className="py-2 pr-4 text-slate-400 text-xs">{log.species}</td>
                    <td className="py-2 pr-4 text-farm-400 font-medium">{log.weight} kg</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded border ${log.quality === 'A' ? 'badge-optimal' : 'badge-warning'}`}>{log.quality}</span>
                    </td>
                    <td className="py-2 text-slate-500 text-xs">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
