import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import EvaluationForm from '@/components/evaluation/EvaluationForm'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperty } from '@/hooks/useProperty'
import { getPresetAxes } from '@/lib/presets'
import type { EvaluationAxis, Property } from '@/types'

export default function EvaluationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProperty, updateProperty } = useProperty()
  const [property, setProperty] = useState<Property | null>(null)
  const [axes, setAxes] = useState<EvaluationAxis[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    getProperty(id).then((p) => {
      if (p) {
        setProperty(p)
        setAxes(
          p.evaluationAxes.length > 0 ? p.evaluationAxes : getPresetAxes(p.type),
        )
      }
      setLoading(false)
    })
  }, [id, getProperty])

  const handleSubmit = async () => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateProperty(id, { evaluationAxes: axes })
      toast.success('評価を保存しました')
      navigate(`/properties/${id}`)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <Layout>
          <div className="py-4 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
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

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">
              <Link to={`/properties/${property.id}`} className="hover:underline">
                {property.name}
              </Link>
            </p>
            <h1 className="text-xl font-bold">評価を入力</h1>
          </div>

          <EvaluationForm axes={axes} onChange={setAxes} />

          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '評価を保存する'}
          </Button>
        </div>
      </Layout>
    </>
  )
}
