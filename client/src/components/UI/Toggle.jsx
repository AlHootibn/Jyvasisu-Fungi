import clsx from 'clsx'

export default function Toggle({ enabled, onChange, size = 'md', disabled }) {
  const sizes = { sm: 'w-8 h-4', md: 'w-11 h-6' }
  const thumbSizes = { sm: 'w-3 h-3 translate-x-0.5', md: 'w-5 h-5 translate-x-0.5' }
  const thumbOn = { sm: 'translate-x-4', md: 'translate-x-5' }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative inline-flex rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-farm-500 focus:ring-offset-2 focus:ring-offset-slate-800',
        sizes[size],
        enabled ? 'bg-farm-500' : 'bg-slate-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={clsx(
        'pointer-events-none inline-block bg-white rounded-full shadow transition-transform',
        thumbSizes[size],
        'mt-0.5',
        enabled ? thumbOn[size] : 'translate-x-0.5'
      )} />
    </button>
  )
}
