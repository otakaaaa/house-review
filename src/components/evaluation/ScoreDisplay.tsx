import { calcTotalScore } from '@/lib/scoring'
import type { EvaluationAxis } from '@/types'

interface ScoreDisplayProps {
  axes: EvaluationAxis[]
}

export default function ScoreDisplay({ axes }: ScoreDisplayProps) {
  const score = calcTotalScore(axes)
  const ratedCount = axes.filter((a) => a.rating !== null).length
  const totalCount = axes.length

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
