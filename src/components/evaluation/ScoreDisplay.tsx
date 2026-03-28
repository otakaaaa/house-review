import { RATING_SCORE } from '@/lib/scoring'
import type { FlatEvaluationAxis } from '@/types'

interface ScoreDisplayProps {
  axes: FlatEvaluationAxis[]
}

export default function ScoreDisplay({ axes }: ScoreDisplayProps) {
  const rated = axes.filter((a) => a.rating !== null)
  const ratedCount = rated.length
  const totalCount = axes.length

  const score =
    ratedCount === 0
      ? null
      : Math.round(
          rated.reduce((acc, a) => acc + RATING_SCORE[a.rating!] * a.weight, 0) /
            rated.reduce((acc, a) => acc + a.weight, 0),
        )

  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-bold tabular-nums">
        {score !== null ? score : '—'}
        <span className="text-base font-normal text-muted-foreground"> / 100</span>
      </div>
      {totalCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {ratedCount}/{totalCount} 項目評価済み
        </div>
      )}
    </div>
  )
}
