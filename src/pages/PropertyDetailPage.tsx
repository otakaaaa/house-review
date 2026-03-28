import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Edit, Trash2, ClipboardList, MapPin, Calendar, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import StatusBadge from '@/components/property/StatusBadge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useProperty } from '@/hooks/useProperty'
import {
  PROPERTY_TYPE_LABEL,
  EVALUATION_RATING_LABEL,
  EVALUATOR_LABEL,
  type EvaluatorId,
  type Property,
} from '@/types'
import { RATING_SCORE, calcScoreForEvaluator, flattenForEvaluator } from '@/lib/scoring'
import { cn } from '@/lib/utils'

const EVALUATORS: EvaluatorId[] = ['self', 'spouse']

const RATING_COLOR = (score: number) => {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProperty, deleteProperty } = useProperty()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getProperty(id).then((p) => {
      setProperty(p ?? null)
      setLoading(false)
    })
  }, [id, getProperty])

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProperty(id)
      toast.success('物件を削除しました')
      navigate('/')
    } catch {
      toast.error('削除に失敗しました')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <Layout>
          <div className="py-4 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Layout>
      </>
    )
  }

  if (!property) {
    return (
      <>
        <Header />
        <Layout>
          <div className="py-16 text-center space-y-3">
            <p className="text-muted-foreground">物件が見つかりません</p>
            <Link to="/" className={buttonVariants({ variant: 'outline' })}>
              一覧に戻る
            </Link>
          </div>
        </Layout>
      </>
    )
  }

  const hasEvaluations = property.evaluationAxes.length > 0

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{PROPERTY_TYPE_LABEL[property.type]}</Badge>
                <StatusBadge status={property.status} />
              </div>
              <h1 className="text-2xl font-bold">{property.name}</h1>
              {property.address && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={13} />
                  {property.address}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Link
                to={`/properties/${property.id}/edit`}
                className={buttonVariants({ variant: 'outline', size: 'icon' })}
              >
                <Edit size={16} />
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {property.photos.length > 0 && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {property.photos.map((photo) => (
                  <div key={photo.id} className="shrink-0 space-y-1">
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption || '物件写真'}
                      className="h-40 w-40 rounded-lg object-cover"
                    />
                    {photo.caption && (
                      <p className="text-xs text-muted-foreground text-center w-40 truncate">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {property.price !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">価格</p>
                <p className="font-semibold">{property.price.toLocaleString()}万円</p>
              </div>
            )}
            {property.landArea !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">土地面積</p>
                <p className="font-semibold">{property.landArea}m²</p>
              </div>
            )}
            {property.buildingArea !== null && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 size={11} />建物面積
                </p>
                <p className="font-semibold">{property.buildingArea}m²</p>
              </div>
            )}
            {property.visitDate && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={11} />訪問日
                </p>
                <p className="font-semibold">{property.visitDate}</p>
              </div>
            )}
          </div>

          {property.memo && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">メモ</p>
              <p className="text-sm whitespace-pre-wrap">{property.memo}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">評価</h2>
              <Link
                to={`/properties/${property.id}/evaluation`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
              >
                <ClipboardList size={14} />
                {hasEvaluations ? '評価を編集する' : '評価を入力する'}
              </Link>
            </div>

            {hasEvaluations ? (
              <div className="space-y-4">
                {/* 評価者別スコアサマリー */}
                <div className="flex gap-3 flex-wrap">
                  {EVALUATORS.map((evaluatorId) => {
                    const score = calcScoreForEvaluator(property.evaluationAxes, evaluatorId)
                    return (
                      <div key={evaluatorId} className="rounded-lg border px-4 py-2 text-center min-w-20">
                        <p className="text-xs text-muted-foreground">{EVALUATOR_LABEL[evaluatorId]}</p>
                        <p className="text-2xl font-bold tabular-nums">
                          {score !== null ? score : '—'}
                          <span className="text-xs font-normal text-muted-foreground"> / 100</span>
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* 評価軸リスト */}
                <div className="space-y-2">
                  {property.evaluationAxes.map((axis) => (
                    <div key={axis.id} className="rounded-lg border p-3 space-y-2">
                      <span className="text-sm font-medium">{axis.name}</span>
                      <div className="grid grid-cols-2 gap-2">
                        {EVALUATORS.map((evaluatorId) => {
                          const flat = flattenForEvaluator([axis], evaluatorId)[0]
                          return (
                            <div key={evaluatorId} className="space-y-0.5">
                              <p className="text-xs text-muted-foreground">{EVALUATOR_LABEL[evaluatorId]}</p>
                              {flat.rating ? (
                                <>
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      RATING_COLOR(RATING_SCORE[flat.rating]),
                                    )}
                                  >
                                    {EVALUATION_RATING_LABEL[flat.rating]}
                                  </span>
                                  {flat.comment && (
                                    <p className="text-xs text-muted-foreground">{flat.comment}</p>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">未評価</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                まだ評価が入力されていません
              </p>
            )}
          </div>
        </div>
      </Layout>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>物件を削除しますか？</DialogTitle>
            <DialogDescription>
              「{property.name}」を削除します。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '削除中...' : '削除する'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
