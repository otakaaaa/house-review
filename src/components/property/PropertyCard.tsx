import { Link } from 'react-router-dom'
import { MapPin, Calendar, Check, Trees, Home } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { useUIStore } from '@/store/uiStore'
import { PROPERTY_TYPE_LABEL, type Property, type PropertyStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_ACCENT: Record<PropertyStatus, string> = {
  considering: 'border-l-blue-400',
  visited:     'border-l-green-400',
  rejected:    'border-l-gray-300',
  contracted:  'border-l-purple-400',
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null

  const { bg, text } =
    score >= 75 ? { bg: 'bg-green-100',  text: 'text-green-700' } :
    score >= 50 ? { bg: 'bg-yellow-100', text: 'text-yellow-700' } :
    score >= 25 ? { bg: 'bg-orange-100', text: 'text-orange-700' } :
                  { bg: 'bg-red-100',    text: 'text-red-700' }

  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 min-w-12', bg)}>
      <span className={cn('text-xl font-bold tabular-nums leading-none', text)}>{score}</span>
      <span className={cn('text-[10px] leading-none mt-0.5', text)}>/ 100</span>
    </div>
  )
}

function PhotoPlaceholder({ type }: { type: Property['type'] }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      {type === 'built'
        ? <Home size={24} className="text-muted-foreground/40" />
        : <Trees size={24} className="text-muted-foreground/40" />
      }
    </div>
  )
}

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { compareIds, toggleCompare } = useUIStore()
  const isSelected = compareIds.includes(property.id)

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md border-l-4',
        STATUS_ACCENT[property.status],
        isSelected && 'ring-2 ring-primary ring-offset-1',
      )}
    >
      {/* サムネイル */}
      <div className="w-28 shrink-0 self-stretch">
        {property.photos.length > 0 ? (
          <img
            src={property.photos[0].dataUrl}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <PhotoPlaceholder type={property.type} />
        )}
      </div>

      {/* コンテンツ */}
      <Link
        to={`/properties/${property.id}`}
        className="flex flex-1 min-w-0 flex-col justify-between p-3 gap-2"
      >
        {/* 上段: バッジ・物件名 */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
              {PROPERTY_TYPE_LABEL[property.type]}
            </span>
            <StatusBadge status={property.status} />
          </div>
          <p className="font-bold text-base leading-snug truncate">{property.name}</p>
          {property.address && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin size={11} className="shrink-0" />
              {property.address}
            </p>
          )}
        </div>

        {/* 下段: 価格・訪問日 */}
        <div className="flex items-center gap-3 flex-wrap">
          {property.price !== null && (
            <span className="text-sm font-semibold">
              {property.price.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">万円</span>
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

      {/* 右端: スコア・比較ボタン */}
      <div className="flex flex-col items-center justify-between p-3 shrink-0 gap-3">
        <ScoreBadge score={property.totalScore} />
        <button
          type="button"
          onClick={() => toggleCompare(property.id)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-all',
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border bg-background hover:border-primary/60',
          )}
          aria-label={isSelected ? '比較から外す' : '比較に追加'}
        >
          {isSelected && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
    </div>
  )
}
