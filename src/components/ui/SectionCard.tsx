import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ title, subtitle, action, children, className }: Props) {
  return (
    <div className={clsx('card', className)}>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="section-rail">
          <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">
        {children}
      </div>
    </div>
  )
}
