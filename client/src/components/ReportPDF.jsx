import React from 'react'
import {
  Document, Page, Text, View, StyleSheet,
  Svg, Rect, G, Line,
} from '@react-pdf/renderer'
import { format, subDays } from 'date-fns'

// ── Brand colours ────────────────────────────────────────────────────────────
const C = {
  green:       '#16a34a',
  greenMid:    '#22c55e',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
  white:       '#ffffff',
  near:        '#f8fafc',
  border:      '#e2e8f0',
  text:        '#0f172a',
  sub:         '#334155',
  muted:       '#64748b',
  light:       '#94a3b8',
  blue:        '#3b82f6',
  purple:      '#a855f7',
  amber:       '#d97706',
  red:         '#dc2626',
  gradeA:      '#15803d',
  gradeABg:    '#dcfce7',
  gradeB:      '#92400e',
  gradeBBg:    '#fef3c7',
  gradeC:      '#991b1b',
  gradeCBg:    '#fee2e2',
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: 'Helvetica',
    paddingBottom: 52,
  },

  // ── Header strip
  headerStrip: {
    backgroundColor: C.green,
    paddingTop: 30,
    paddingBottom: 22,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  farmName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  reportSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 4,
  },
  headerRight: { alignItems: 'flex-end' },
  headerDate: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  headerSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 3,
  },

  // ── Body padding wrapper
  body: { paddingLeft: 40, paddingRight: 40 },

  // ── KPI cards
  kpiRow: { flexDirection: 'row', marginBottom: 26 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.near,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 10,
  },
  kpiCardLast: {
    flex: 1,
    backgroundColor: C.near,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  kpiAccent: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 3,
  },
  kpiLabel: {
    fontSize: 8,
    color: C.muted,
  },

  // ── Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
    marginRight: 7,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
  },

  // ── Bar chart day labels row
  chartLabels: {
    flexDirection: 'row',
    marginTop: 4,
    paddingLeft: 8,
    paddingRight: 8,
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    color: C.muted,
  },

  // ── Chart legend
  legendRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 8.5,
    color: C.sub,
  },

  // ── Room distribution bars
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  roomName: {
    fontSize: 9.5,
    color: C.sub,
    width: 54,
  },
  roomBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: C.border,
    borderRadius: 5,
    marginRight: 10,
  },
  roomValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    width: 42,
    textAlign: 'right',
  },

  // ── Table
  tableWrap: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tHead: {
    flexDirection: 'row',
    backgroundColor: C.near,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 14,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tRow: {
    flexDirection: 'row',
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 14,
    paddingRight: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tRowAlt: {
    backgroundColor: '#fafafa',
  },
  th: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
  },
  td: { fontSize: 9.5, color: C.sub },
  tdBold: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.text },
  tdGreen: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.green },
  tdMuted: { fontSize: 9.5, color: C.light },

  // ── Grade badge
  badgeWrap: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 3,
  },
  badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold' },

  // ── Two-column layout for section 3
  twoCol: { flexDirection: 'row', marginBottom: 24 },
  colLeft: { flex: 3, marginRight: 16 },
  colRight: { flex: 2 },

  // ── Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 24,
  },

  // ── Footer (fixed)
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerLeft: { fontSize: 8, color: C.muted },
  footerRight: { fontSize: 8, color: C.muted },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROOM_COLORS = [C.green, C.blue, C.purple]

function SectionLabel({ title }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionDot} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  )
}

function KpiCard({ value, label, accent, last }) {
  return (
    <View style={last ? s.kpiCardLast : s.kpiCard}>
      <View style={[s.kpiAccent, { backgroundColor: accent }]} />
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  )
}

function GradeBadge({ quality }) {
  const map = {
    A: { bg: C.gradeABg, color: C.gradeA, label: 'Grade A' },
    B: { bg: C.gradeBBg, color: C.gradeB, label: 'Grade B' },
    C: { bg: C.gradeCBg, color: C.gradeC, label: 'Grade C' },
  }
  const m = map[quality] || map.C
  return (
    <View style={[s.badgeWrap, { backgroundColor: m.bg }]}>
      <Text style={[s.badgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  )
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const W = 515
  const H = 110
  const padL = 28
  const padR = 4
  const padT = 8
  const padB = 0
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const barW = (plotW / data.length) * 0.55
  const step  = plotW / data.length

  const maxVal = Math.max(
    0.1,
    ...data.map(d => parseFloat(d.a1) + parseFloat(d.b2) + parseFloat(d.c3))
  )

  // Y-axis guide lines (4 lines)
  const guides = [0.25, 0.5, 0.75, 1].map(f => ({
    y: padT + plotH * (1 - f),
    label: (maxVal * f).toFixed(1),
  }))

  return (
    <Svg width={W} height={H + 2}>
      {/* Grid lines */}
      {guides.map((g, i) => (
        <G key={i}>
          <Line
            x1={padL} y1={g.y} x2={W - padR} y2={g.y}
            stroke={C.border} strokeWidth={0.5}
          />
          <Text
            x={padL - 3} y={g.y + 3}
            style={{ fontSize: 7, fill: C.light }}
            textAnchor="end"
          >
            {g.label}
          </Text>
        </G>
      ))}

      {/* Stacked bars */}
      {data.map((d, i) => {
        const a1 = (parseFloat(d.a1) / maxVal) * plotH
        const b2 = (parseFloat(d.b2) / maxVal) * plotH
        const c3 = (parseFloat(d.c3) / maxVal) * plotH
        const total = a1 + b2 + c3
        const x = padL + i * step + (step - barW) / 2
        const bottom = padT + plotH

        return (
          <G key={i}>
            {c3 > 0 && <Rect x={x} y={bottom - total}        width={barW} height={c3} fill={C.purple} rx={0} />}
            {b2 > 0 && <Rect x={x} y={bottom - total + c3}   width={barW} height={b2} fill={C.blue}   rx={0} />}
            {a1 > 0 && <Rect x={x} y={bottom - a1}           width={barW} height={a1} fill={C.green}  rx={0} />}
          </G>
        )
      })}

      {/* Base line */}
      <Line
        x1={padL} y1={padT + plotH}
        x2={W - padR} y2={padT + plotH}
        stroke={C.border} strokeWidth={1}
      />
    </Svg>
  )
}

// ── Room distribution bar ─────────────────────────────────────────────────────
function RoomBar({ name, value, maxVal, color }) {
  const pct = maxVal > 0 ? Math.max(0, Math.min(1, value / maxVal)) : 0
  const BAR_MAX_W = 280

  return (
    <View style={s.roomRow}>
      <Text style={s.roomName}>{name}</Text>
      <View style={[s.roomBarTrack, { position: 'relative' }]}>
        <View style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: `${pct * 100}%`,
          backgroundColor: color,
          borderRadius: 5,
        }} />
      </View>
      <Text style={s.roomValue}>{value.toFixed(1)} kg</Text>
    </View>
  )
}

// ── Species breakdown ─────────────────────────────────────────────────────────
function SpeciesRow({ label, value, total, color }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0'
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 7 }} />
      <Text style={{ fontSize: 9.5, color: C.sub, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 9.5, color: C.muted, marginRight: 8 }}>{pct}%</Text>
      <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.text, width: 44, textAlign: 'right' }}>
        {value.toFixed(1)} kg
      </Text>
    </View>
  )
}

// ── Main document ─────────────────────────────────────────────────────────────
export default function ReportPDF({ harvestLogs = [], sensors = {}, rooms = [], farms = [] }) {
  const today    = new Date()
  const farmName = farms[0]?.name || 'JyväSisu Fungi'
  const location = farms[0]?.location || 'Jyväskylä, Finland'

  // ── KPI stats
  const totalWeight = harvestLogs.reduce((s, h) => s + h.weight, 0)
  const gradeA      = harvestLogs.filter(h => h.quality === 'A').length
  const gradeAPct   = harvestLogs.length > 0 ? Math.round((gradeA / harvestLogs.length) * 100) : 0
  const avgDaily    = harvestLogs.length > 0 ? (totalWeight / 30) : 0
  const bestDay     = (() => {
    const byDate = {}
    harvestLogs.forEach(h => { byDate[h.date] = (byDate[h.date] || 0) + h.weight })
    return Math.max(0, ...Object.values(byDate))
  })()

  // ── 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(today, 6 - i), 'yyyy-MM-dd')
    const day  = format(subDays(today, 6 - i), 'MMM d')
    const logs = harvestLogs.filter(h => h.date === date)
    return {
      day,
      a1: logs.filter(h => h.roomId === 1).reduce((s, h) => s + h.weight, 0),
      b2: logs.filter(h => h.roomId === 2).reduce((s, h) => s + h.weight, 0),
      c3: logs.filter(h => h.roomId === 3).reduce((s, h) => s + h.weight, 0),
    }
  })

  // ── Room totals (30d)
  const roomTotals = [
    { id: 1, name: 'Room A1', value: harvestLogs.filter(h => h.roomId === 1).reduce((s, h) => s + h.weight, 0) },
    { id: 2, name: 'Room B2', value: harvestLogs.filter(h => h.roomId === 2).reduce((s, h) => s + h.weight, 0) },
    { id: 3, name: 'Room C3', value: harvestLogs.filter(h => h.roomId === 3).reduce((s, h) => s + h.weight, 0) },
  ]
  const maxRoomVal = Math.max(0.01, ...roomTotals.map(r => r.value))

  // ── Species totals
  const species = ['Oyster', 'Shiitake', 'Button']
  const speciesColors = ['#22c55e', '#3b82f6', '#a855f7']
  const speciesTotals = species.map((sp, i) => ({
    name: sp,
    color: speciesColors[i],
    value: harvestLogs.filter(h => h.species === sp).reduce((s, h) => s + h.weight, 0),
  }))

  // ── Latest sensor readings
  const sensorRoom1 = sensors[1] || sensors['1'] || {}

  // ── Sorted harvest log
  const sortedLogs = [...harvestLogs].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Document
      title={`${farmName} — Production Report`}
      author={farmName}
      subject="Monthly Production Report"
      creator="JyväSisu Fungi IoT System"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 1 — Summary
         ═══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>

        {/* Header strip */}
        <View style={s.headerStrip}>
          <View>
            <Text style={s.farmName}>{farmName}</Text>
            <Text style={s.reportSubtitle}>Production Report  ·  {location}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{format(today, 'MMMM d, yyyy')}</Text>
            <Text style={s.headerSub}>30-day harvest summary</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* KPI row */}
          <View style={s.kpiRow}>
            <KpiCard value={`${totalWeight.toFixed(1)} kg`} label="TOTAL YIELD (30 DAYS)" accent={C.green} />
            <KpiCard value={`${gradeAPct}%`}               label="GRADE A QUALITY"        accent={C.blue} />
            <KpiCard value={`${avgDaily.toFixed(1)} kg`}   label="AVG DAILY YIELD"        accent={C.purple} />
            <KpiCard value={`${bestDay.toFixed(1)} kg`}    label="BEST SINGLE DAY"        accent={C.amber} last />
          </View>

          {/* 7-day harvest chart */}
          <View style={s.section}>
            <SectionLabel title="DAILY HARVEST BY ROOM — LAST 7 DAYS" />
            <View style={[s.tableWrap, { padding: 12 }]}>
              <BarChart data={last7Days} />
              <View style={s.chartLabels}>
                {last7Days.map((d, i) => (
                  <Text key={i} style={s.chartLabel}>{d.day}</Text>
                ))}
              </View>
              <View style={s.legendRow}>
                {[['Room A1', C.green], ['Room B2', C.blue], ['Room C3', C.purple]].map(([name, color]) => (
                  <View key={name} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: color }]} />
                    <Text style={s.legendText}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Room totals + Species breakdown side by side */}
          <View style={s.twoCol}>
            <View style={s.colLeft}>
              <SectionLabel title="YIELD BY ROOM (30 DAYS)" />
              <View style={[s.tableWrap, { padding: 14 }]}>
                {roomTotals.map((r, i) => (
                  <RoomBar key={r.id} name={r.name} value={r.value} maxVal={maxRoomVal} color={ROOM_COLORS[i]} />
                ))}
              </View>
            </View>

            <View style={s.colRight}>
              <SectionLabel title="BY SPECIES" />
              <View style={[s.tableWrap, { padding: 14 }]}>
                {speciesTotals.map(sp => (
                  <SpeciesRow key={sp.name} label={sp.name} value={sp.value} total={totalWeight} color={sp.color} />
                ))}
                <View style={{ borderTopWidth: 1, borderTopColor: C.border, marginTop: 8, paddingTop: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 9, color: C.muted }}>Total</Text>
                    <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.text }}>{totalWeight.toFixed(1)} kg</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Live sensor readings */}
          {Object.keys(sensorRoom1).length > 0 && (
            <View style={s.section}>
              <SectionLabel title="CURRENT SENSOR READINGS — ROOM A1" />
              <View style={s.tableWrap}>
                <View style={s.tHead}>
                  {['Temperature', 'Humidity', 'CO₂', 'Light', 'Moisture'].map(h => (
                    <Text key={h} style={[s.th, { flex: 1 }]}>{h}</Text>
                  ))}
                </View>
                <View style={s.tRow}>
                  <Text style={[s.tdBold, { flex: 1 }]}>{sensorRoom1.temp ?? '—'} °C</Text>
                  <Text style={[s.tdBold, { flex: 1 }]}>{sensorRoom1.humidity ?? '—'} %</Text>
                  <Text style={[s.tdBold, { flex: 1 }]}>{sensorRoom1.co2 ?? '—'} ppm</Text>
                  <Text style={[s.tdBold, { flex: 1 }]}>{sensorRoom1.light ?? '—'} lx</Text>
                  <Text style={[s.tdBold, { flex: 1 }]}>{sensorRoom1.moisture ?? '—'} %</Text>
                </View>
              </View>
            </View>
          )}

        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>{farmName}  ·  Confidential</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 2+ — Full harvest log
         ═══════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>

        {/* Compact header for continuation pages */}
        <View style={[s.headerStrip, { paddingTop: 18, paddingBottom: 16, marginBottom: 24 }]}>
          <Text style={[s.farmName, { fontSize: 16 }]}>{farmName}</Text>
          <Text style={s.headerDate}>Complete Harvest Log</Text>
        </View>

        <View style={s.body}>
          <SectionLabel title={`ALL HARVEST ENTRIES  ·  ${sortedLogs.length} RECORDS`} />

          <View style={s.tableWrap}>
            {/* Table head */}
            <View style={s.tHead}>
              <Text style={[s.th, { width: 60 }]}>DATE</Text>
              <Text style={[s.th, { width: 52 }]}>ROOM</Text>
              <Text style={[s.th, { width: 56 }]}>SPECIES</Text>
              <Text style={[s.th, { width: 50 }]}>WEIGHT</Text>
              <Text style={[s.th, { width: 56 }]}>GRADE</Text>
              <Text style={[s.th, { flex: 1 }]}>NOTES</Text>
            </View>

            {/* Table rows */}
            {sortedLogs.map((log, i) => (
              <View key={log.id} style={[s.tRow, i % 2 === 1 && s.tRowAlt]} wrap={false}>
                <Text style={[s.tdMuted, { width: 60 }]}>{log.date}</Text>
                <Text style={[s.td, { width: 52 }]}>{log.roomName}</Text>
                <Text style={[s.td, { width: 56 }]}>{log.species}</Text>
                <Text style={[s.tdGreen, { width: 50 }]}>{log.weight.toFixed(1)} kg</Text>
                <View style={{ width: 56 }}>
                  <GradeBadge quality={log.quality} />
                </View>
                <Text style={[s.tdMuted, { flex: 1 }]}>{log.notes || '—'}</Text>
              </View>
            ))}

            {/* Totals row */}
            <View style={[s.tRow, { backgroundColor: C.greenBg }]}>
              <Text style={[s.tdBold, { width: 60 }]}>TOTAL</Text>
              <Text style={[s.td, { width: 52 }]} />
              <Text style={[s.td, { width: 56 }]} />
              <Text style={[s.tdGreen, { width: 50 }]}>{totalWeight.toFixed(1)} kg</Text>
              <Text style={[s.td, { width: 56 }]}>{gradeAPct}% A</Text>
              <Text style={[s.tdMuted, { flex: 1 }]}>{sortedLogs.length} entries</Text>
            </View>
          </View>
        </View>

        {/* Footer (same, fixed) */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>{farmName}  ·  Confidential</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
