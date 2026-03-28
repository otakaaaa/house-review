import { Link } from 'react-router-dom'
import { MapPin, Calendar, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import StatusBadge from './StatusBadge'
import { useUIStore } from '@/store/uiStore'
import { PROPERTY_TYPE_LABEL, type Property } from '@/types'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { compareIds, toggleCompare } = useUIStore()
  const isSelected = compareIds.includes(property.id)

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
      )}
    >
      <div className="flex">
        {property.photos.length > 0 && (
          <div className="w-24 shrink-0">
            <img
              src={property.photos[0].dataUrl}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/properties/${property.id}`}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                  {PROPERTY_TYPE_LABEL[property.type]}
                </span>
                <StatusBadge status={property.status} />
              </div>
              <p className="mt-1 font-semibold truncate">{property.name}</p>
              {property.address && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                  <MapPin size={11} />
                  {property.address}
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                {property.price !== null && (
                  <span className="text-sm font-medium">
                    {property.price.toLocaleString()}万円
                  </span>
                )}
                {property.visitDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={11} />
                    {property.visitDate}
                  </span>
                )}
              </div>
            </Link>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {property.totalScore !== null && (
                <div className="text-right">
                  <div className="text-xl font-bold tabular-nums">
                    {property.totalScore}
                  </div>
                  <div className="text-[10px] text-muted-foreground">/ 100</div>
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleCompare(property.id)}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border hover:border-primary',
                )}
                aria-label={isSelected ? '比較から外す' : '比較に追加'}
              >
                {isSelected && <Check size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
