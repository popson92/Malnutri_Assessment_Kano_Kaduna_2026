import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type Rail = 'primary' | 'accent' | 'success' | 'warning' | 'danger'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; label: string }
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  rail?: Rail
  className?: string
}

const colorMap = {
  default: 'text-ink',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
}

export function KpiCard({ title, value, subtitle, icon, trend, color = 'default', rail = 'accent', className }: Props) {
  return (
    <div className={clsx('kpi-card', `kpi-rail-${rail}`, className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="kpi-label truncate">{title}</p>
          <p className={clsx('kpi-value mt-1 text-2xl', colorMap[color])}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
          {trend && (
            <p className={clsx('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-light-blue text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
