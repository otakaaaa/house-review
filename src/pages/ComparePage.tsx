import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import CompareTable from '@/components/compare/CompareTable'
import { Button, buttonVariants } from '@/components/ui/button'
import { useCompare } from '@/hooks/useCompare'
import { useUIStore } from '@/store/uiStore'

export default function ComparePage() {
  const { properties, compareIds } = useCompare()
  const { clearCompare, toggleCompare } = useUIStore()

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">比較</h1>
            {compareIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompare}>
                <X size={14} />
                選択をクリア
              </Button>
            )}
          </div>

          {compareIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <p className="text-muted-foreground">
                比較する物件が選択されていません
              </p>
              <p className="text-xs text-muted-foreground">
                一覧画面で物件カードのチェックボックスを選択してください
              </p>
              <Link to="/" className={buttonVariants({ variant: 'outline' })}>
                一覧に戻る
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs"
                  >
                    <Link to={`/properties/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(p.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <CompareTable properties={properties} />
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
