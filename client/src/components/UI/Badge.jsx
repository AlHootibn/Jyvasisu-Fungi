import clsx from 'clsx'

export default function Badge({ variant = 'neutral', children, className }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
      variant === 'optimal' && 'badge-optimal',
      variant === 'warning' && 'badge-warning',
      variant === 'critical' && 'badge-critical',
      variant === 'info' && 'badge-info',
      variant === 'neutral' && 'badge-neutral',
      className
    )}>
      {children}
    </span>
  )
}
