import { Badge } from '@/components/ui/badge'
import { PROPERTY_STATUS_LABEL, type PropertyStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<PropertyStatus, string> = {
  considering: 'bg-blue-100 text-blue-800',
  visited: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-600',
  contracted: 'bg-purple-100 text-purple-800',
}

interface StatusBadgeProps {
  status: PropertyStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn('border-0', STATUS_VARIANT[status])}>
      {PROPERTY_STATUS_LABEL[status]}
    </Badge>
  )
}
