import { Link } from 'react-router-dom'
import { MapPin, Calendar, Check, Trees, Home } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { useUIStore } from '@/store/uiStore'
import { PROPERTY_TYPE_LABEL, type Property } from '@/types'
import { cn } from '@/lib/utils'

function ScoreOverlay({ score }: { score: number | null }) {
  if (score === null) return null

  const style =
    score >= 75 ? 'bg-emerald-500 text-white' :
    score >= 50 ? 'bg-amber-500 text-white'   :
    score >= 25 ? 'bg-orange-500 text-white'  :
                  'bg-red-500 text-white'

  return (
    <div
      className={cn(
        'absolute top-3 right-3 flex flex-col items-center justify-center rounded-full w-12 h-12 shadow-lg',
        style,
      )}
    >
      <span className="text-base font-bold tabular-nums leading-none">{score}</span>
      <span className="text-[9px] leading-none opacity-80">/100</span>
    </div>
  )
}

function PhotoArea({ property }: { property: Property }) {
  const isRejected = property.status === 'rejected'

  return (
    <div className="relative w-full h-52 overflow-hidden">
      {property.photos.length > 0 ? (
        <img
          src={property.photos[0].dataUrl}
          alt={property.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
            isRejected && 'grayscale opacity-50',
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#efefef]">
          {property.type === 'built'
            ? <Home size={36} className="text-gray-300" />
            : <Trees size={36} className="text-gray-300" />
          }
        </div>
      )}

      {/* 上部グラデーション（種別バッジを見やすく） */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/30 to-transparent" />
      {/* 下部グラデーション（コンテンツへの繋がり） */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />

      {/* 種別バッジ（画像左上） */}
      <span className="absolute top-3 left-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
        {PROPERTY_TYPE_LABEL[property.type]}
      </span>

      {/* スコアバッジ（画像右上） */}
      <ScoreOverlay score={property.totalScore} />

      {/* 見送りオーバーレイ */}
      {isRejected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-gray-900/60 px-4 py-1 text-xs font-bold tracking-widest text-white uppercase backdrop-blur-sm">
            ARCHIVED
          </span>
        </div>
      )}
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
        'group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md',
        isSelected ? 'ring-2 ring-[#05111e] ring-offset-2' : 'ring-1 ring-black/6',
      )}
    >
      {/* 画像エリア（上部・フルwidth） */}
      <Link to={`/properties/${property.id}`} className="block">
        <PhotoArea property={property} />
      </Link>

      {/* コンテンツエリア（下部） */}
      <Link to={`/properties/${property.id}`} className="block px-4 pt-3 pb-4 space-y-2">
        {/* ステータス */}
        <StatusBadge status={property.status} />

        {/* 物件名 */}
        <p
          className="font-bold text-[15px] leading-snug text-[#1b1b1d]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {property.name}
        </p>

        {/* 住所 */}
        {property.address && (
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{property.address}</span>
          </p>
        )}

        {/* 価格・訪問日 */}
        <div className="flex items-center gap-4 pt-1">
          {property.price !== null && (
            <span
              className="text-sm font-bold text-[#1b1b1d]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {property.price.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-0.5">万円</span>
            </span>
          )}
          {property.visitDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} />
              {property.visitDate}
            </span>
          )}
        </div>
      </Link>

      {/* 比較チェックボックス */}
      <button
        type="button"
        onClick={() => toggleCompare(property.id)}
        className={cn(
          'absolute bottom-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all',
          isSelected
            ? 'bg-[#05111e] border-[#05111e] text-white shadow-sm'
            : 'border-gray-300 bg-white hover:border-[#05111e]/50',
        )}
        aria-label={isSelected ? '比較から外す' : '比較に追加'}
      >
        {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>
    </div>
  )
}
