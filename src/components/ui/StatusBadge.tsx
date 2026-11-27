import { clsx } from 'clsx'

interface Props {
  status: 'completed' | 'partial' | 'pending' | 'closed' | 'not_sam_site' | 'inaccessible' | 'refused' | 'other' | string
  label?: string
}

const statusStyles: Record<string, string> = {
  completed: 'badge-success',
  partial: 'badge-warning',
  pending: 'badge-grey',
  closed: 'badge-danger',
  not_sam_site: 'badge-grey',
  inaccessible: 'badge-danger',
  refused: 'badge-danger',
}

const statusLabels: Record<string, string> = {
  completed: 'Completed',
  partial: 'Partly completed',
  pending: 'Pending',
  closed: 'Closed',
  not_sam_site: 'Not SAM site',
  inaccessible: 'Inaccessible',
  refused: 'Refused',
  other: 'Other',
}

export function StatusBadge({ status, label }: Props) {
  return (
    <span className={clsx(statusStyles[status] ?? 'badge-grey')}>
      {label ?? statusLabels[status] ?? status}
    </span>
  )
}
