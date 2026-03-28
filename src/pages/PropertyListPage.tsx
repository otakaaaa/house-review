import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import PropertyCard from '@/components/property/PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties } from '@/hooks/useProperties'
import { useUIStore } from '@/store/uiStore'
import {
  type PropertyType,
  type PropertyStatus,
} from '@/types'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const SORT_LABEL: Record<string, string> = {
  createdAt_desc: '登録順（新）',
  createdAt_asc:  '登録順（古）',
  totalScore_desc: 'スコア高順',
  totalScore_asc:  'スコア低順',
  visitDate_desc:  '訪問日（新）',
  visitDate_asc:   '訪問日（古）',
  price_asc:  '価格（安）',
  price_desc: '価格（高）',
}

const TYPE_FILTERS: { value: PropertyType | 'all'; label: string }[] = [
  { value: 'all',   label: 'すべて' },
  { value: 'land',  label: '土地' },
  { value: 'built', label: '建売' },
]

const STATUS_FILTERS: { value: PropertyStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'すべて' },
  { value: 'considering', label: '検討中' },
  { value: 'visited',     label: '訪問済み' },
  { value: 'rejected',    label: '見送り' },
  { value: 'contracted',  label: '契約済み' },
]

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl px-5 py-3.5 text-sm font-bold transition-all whitespace-nowrap',
        active
          ? 'bg-[#05111e] text-white'
          : 'bg-[#efefef] text-[#1b1b1d] hover:bg-[#e4e4e4]',
      )}
    >
      {label}
    </button>
  )
}

function FilterSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 rounded-full bg-[#775a19]" />
      <span
        className="text-sm font-bold text-[#1b1b1d]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {children}
      </span>
    </div>
  )
}

export default function PropertyListPage() {
  const { properties } = useProperties()
  const {
    filterType,
    filterStatus,
    sortKey,
    sortOrder,
    setFilterType,
    setFilterStatus,
    setSort,
  } = useUIStore()

  return (
    <>
      <Header />
      <Layout>
        <div className="py-6 space-y-6">

          {/* ページヘッダー */}
          <div>
            <h1
              className="text-3xl font-bold text-[#1b1b1d]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              物件一覧
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {properties !== undefined && properties.length > 0
                ? `${properties.length}件の物件を管理中`
                : 'あなたの物件ポートフォリオ'}
            </p>
          </div>

          {/* フィルター */}
          <div className="space-y-5">
            {/* 種別 */}
            <div>
              <FilterSectionLabel>種別</FilterSectionLabel>
              <div className="flex gap-2 flex-wrap">
                {TYPE_FILTERS.map(({ value, label }) => (
                  <FilterChip
                    key={value}
                    label={label}
                    active={filterType === value}
                    onClick={() => setFilterType(value)}
                  />
                ))}
              </div>
            </div>

            {/* 状態 */}
            <div>
              <FilterSectionLabel>状態</FilterSectionLabel>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map(({ value, label }) => (
                  <FilterChip
                    key={value}
                    label={label}
                    active={filterStatus === value}
                    onClick={() => setFilterStatus(value)}
                  />
                ))}
              </div>
            </div>

            {/* 並び順 */}
            <Select
              value={`${sortKey}_${sortOrder}`}
              onValueChange={(v) => {
                if (!v) return
                const idx = v.lastIndexOf('_')
                const key = v.slice(0, idx) as typeof sortKey
                const order = v.slice(idx + 1) as typeof sortOrder
                setSort(key, order)
              }}
            >
              <SelectTrigger className="h-auto w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium shadow-sm">
                <SelectValue>
                  {SORT_LABEL[`${sortKey}_${sortOrder}`]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">登録順（新）</SelectItem>
                <SelectItem value="createdAt_asc">登録順（古）</SelectItem>
                <SelectItem value="totalScore_desc">スコア高順</SelectItem>
                <SelectItem value="totalScore_asc">スコア低順</SelectItem>
                <SelectItem value="visitDate_desc">訪問日（新）</SelectItem>
                <SelectItem value="visitDate_asc">訪問日（古）</SelectItem>
                <SelectItem value="price_asc">価格（安）</SelectItem>
                <SelectItem value="price_desc">価格（高）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* リスト */}
          {properties === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                🏠
              </div>
              <div className="space-y-1">
                <p
                  className="font-semibold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  物件がまだありません
                </p>
                <p className="text-sm text-muted-foreground">最初の物件を登録してみましょう</p>
              </div>
              <Link
                to="/properties/new"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'rounded-full px-5 bg-[#05111e] hover:bg-[#0a1f33] text-white border-0',
                )}
              >
                <Plus size={15} />
                登録する
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
