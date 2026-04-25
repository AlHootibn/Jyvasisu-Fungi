import { Droplets, Fan, Flame, Lightbulb, Waves, Zap } from 'lucide-react'
import clsx from 'clsx'
import Toggle from '../UI/Toggle'
import { useAuth } from '../../contexts/AuthContext'

const DEVICE_ICONS = {
  humidifier: Droplets,
  fan: Fan,
  heater: Flame,
  lights: Lightbulb,
  pump: Waves,
}

export default function DeviceCard({ device, onToggle }) {
  const { canAccess } = useAuth()
  const Icon = DEVICE_ICONS[device.type] || Zap
  const isOn = device.status === 'on'

  return (
    <div className={clsx(
      'flex items-center gap-3 p-3 rounded-xl border transition-all',
      isOn ? 'bg-farm-900/30 border-farm-800/60' : 'bg-slate-800/50 border-slate-700/50'
    )}>
      <div className={clsx('p-2 rounded-lg', isOn ? 'bg-farm-800/60' : 'bg-slate-700')}>
        <Icon size={16} className={isOn ? 'text-farm-400' : 'text-slate-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{device.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border', device.mode === 'auto' ? 'badge-info' : 'badge-neutral')}>
            {device.mode}
          </span>
          <span className="text-[10px] text-slate-500">{device.power}W</span>
        </div>
      </div>
      {canAccess('Farm Manager') && (
        <Toggle enabled={isOn} onChange={() => onToggle(device.id)} size="sm" />
      )}
      {!canAccess('Farm Manager') && (
        <span className={clsx('text-[11px] font-medium', isOn ? 'text-farm-400' : 'text-slate-500')}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      )}
    </div>
  )
}
