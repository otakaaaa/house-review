import { PROPERTY_STATUS_LABEL, type PropertyStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<PropertyStatus, string> = {
  considering: 'bg-[#05111e]/8 text-[#05111e]',
  visited:     'bg-emerald-50 text-emerald-700',
  rejected:    'bg-gray-100 text-gray-500',
  contracted:  'bg-[#775a19]/10 text-[#775a19]',
}

interface StatusBadgeProps {
  status: PropertyStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        STATUS_STYLE[status],
      )}
    >
      {PROPERTY_STATUS_LABEL[status]}
    </span>
  )
}
