import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import EvaluationForm from '@/components/evaluation/EvaluationForm'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperty } from '@/hooks/useProperty'
import { useAxisTemplates } from '@/hooks/useAxisTemplates'
import { getPresetAxes } from '@/lib/presets'
import { flattenForEvaluator, applyFlatChanges, calcScoreForEvaluator } from '@/lib/scoring'
import {
  type AxisTemplate,
  type EvaluationAxis,
  type FlatEvaluationAxis,
  type EvaluatorId,
  type Property,
  EVALUATOR_LABEL,
} from '@/types'
import { cn } from '@/lib/utils'

function mergeAxes(
  templateAxes: AxisTemplate[],
  propertyAxes: EvaluationAxis[],
): EvaluationAxis[] {
  const evalMap = new Map(propertyAxes.map((a) => [a.id, a.evaluations]))
  return templateAxes.map((t) => ({
    id: t.id,
    name: t.name,
    weight: t.weight,
    order: t.order,
    evaluations: evalMap.get(t.id) ?? [],
  }))
}

function toTemplate(axes: EvaluationAxis[]): AxisTemplate[] {
  return axes.map(({ id, name, weight, order }) => ({ id, name, weight, order }))
}

const EVALUATORS: EvaluatorId[] = ['self', 'spouse']

export default function EvaluationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProperty, updateProperty } = useProperty()
  const { getTemplate, saveTemplate } = useAxisTemplates()
  const [property, setProperty] = useState<Property | null>(null)
  const [axes, setAxes] = useState<EvaluationAxis[]>([])
  const [activeEvaluator, setActiveEvaluator] = useState<EvaluatorId>('self')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getProperty(id), null]).then(async ([p]) => {
      if (!p) {
        setLoading(false)
        return
      }
      setProperty(p)

      const template = await getTemplate(p.type)
      if (template) {
        setAxes(mergeAxes(template, p.evaluationAxes))
      } else {
        const initial = p.evaluationAxes.length > 0 ? p.evaluationAxes : getPresetAxes(p.type)
        setAxes(initial)
      }
      setLoading(false)
    })
  }, [id, getProperty, getTemplate])

  const flatAxes = flattenForEvaluator(axes, activeEvaluator)

  const handleFlatChange = (flat: FlatEvaluationAxis[]) => {
    setAxes(applyFlatChanges(axes, flat, activeEvaluator))
  }

  const handleSubmit = async () => {
    if (!id || !property) return
    setIsSubmitting(true)
    try {
      await Promise.all([
        saveTemplate(property.type, toTemplate(axes)),
        updateProperty(id, { evaluationAxes: axes }),
      ])
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

          {/* 評価者タブ */}
          <div className="flex gap-1 border-b">
            {EVALUATORS.map((evaluatorId) => {
              const score = calcScoreForEvaluator(axes, evaluatorId)
              return (
                <button
                  key={evaluatorId}
                  type="button"
                  onClick={() => setActiveEvaluator(evaluatorId)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeEvaluator === evaluatorId
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {EVALUATOR_LABEL[evaluatorId]}
                  {score !== null && (
                    <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                      {score}点
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <EvaluationForm axes={flatAxes} onChange={handleFlatChange} />

          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '評価を保存する'}
          </Button>
        </div>
      </Layout>
    </>
  )
}
