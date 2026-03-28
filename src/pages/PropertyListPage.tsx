import { Link, useNavigate } from 'react-router-dom'
import { Plus, GitCompare, SlidersHorizontal } from 'lucide-react'
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
  PROPERTY_TYPE_LABEL,
  PROPERTY_STATUS_LABEL,
  type PropertyType,
  type PropertyStatus,
} from '@/types'
import { cn } from '@/lib/utils'

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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">物件一覧</h1>
            <Link to="/properties/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
              <Plus size={16} />
              新規登録
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
            <Select
              value={filterType}
              onValueChange={(v) => setFilterType(v as PropertyType | 'all')}
            >
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {PROPERTY_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as PropertyStatus | 'all')}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                {(Object.keys(PROPERTY_STATUS_LABEL) as PropertyStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROPERTY_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
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

          {properties === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <p className="text-muted-foreground">物件がまだ登録されていません</p>
              <Link
                to="/properties/new"
                className={buttonVariants({ variant: 'outline' })}
              >
                最初の物件を登録する
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
            className="shadow-lg rounded-full px-6 gap-1.5"
          >
            <GitCompare size={16} />
            {compareIds.length}件を比較する
          </Button>
        </div>
      )}
    </>
  )
}
