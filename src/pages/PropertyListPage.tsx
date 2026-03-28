import { Link, useNavigate } from 'react-router-dom'
import { Plus, GitCompare, ArrowUpDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
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

export default function PropertyListPage() {
  const { properties } = useProperties()
  const {
    filterType,
    filterStatus,
    sortKey,
    sortOrder,
    compareIds,
    setFilterType,
    setFilterStatus,
    setSort,
  } = useUIStore()
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-4">

          {/* ページヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">物件一覧</h1>
              {properties !== undefined && properties.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{properties.length}件</p>
              )}
            </div>
            <Link
              to="/properties/new"
              className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 rounded-full px-4')}
            >
              <Plus size={15} />
              新規登録
            </Link>
          </div>

          {/* フィルター */}
          <div className="rounded-xl border bg-card p-3 space-y-3">
            {/* 種別 */}
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground">種別</span>
              <div className="flex gap-1.5">
                {TYPE_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterType(value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      filterType === value
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t" />

            {/* ステータス */}
            <div className="flex items-start gap-2">
              <span className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground pt-1">状態</span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterStatus(value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      filterStatus === value
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t" />

            {/* 並び順 */}
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground">並び順</span>
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
                <SelectTrigger className="h-7 w-auto gap-1 border-border px-2.5 text-xs">
                  <ArrowUpDown size={11} className="text-muted-foreground" />
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
          </div>

          {/* リスト */}
          {properties === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                🏠
              </div>
              <div className="space-y-1">
                <p className="font-medium">物件がまだありません</p>
                <p className="text-sm text-muted-foreground">最初の物件を登録してみましょう</p>
              </div>
              <Link
                to="/properties/new"
                className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-5')}
              >
                <Plus size={15} />
                登録する
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </Layout>

      {compareIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={() => navigate('/compare')}
            className="shadow-xl rounded-full px-6 h-11 gap-2 text-sm font-semibold"
          >
            <GitCompare size={16} />
            {compareIds.length}件を比較する
          </Button>
        </div>
      )}
    </>
  )
}
