import type { EvaluationAxis, EvaluationRating } from '@/types'

export const RATING_SCORE: Record<EvaluationRating, number> = {
  best: 100,
  good: 75,
  average: 50,
  compromise: 25,
  dislike: 0,
}

export function calcTotalScore(axes: EvaluationAxis[]): number | null {
  const rated = axes.filter((a) => a.rating !== null)
  if (rated.length === 0) return null
  const weightedSum = rated.reduce(
    (acc, a) => acc + RATING_SCORE[a.rating!] * a.weight,
    0,
  )
  const totalWeight = rated.reduce((acc, a) => acc + a.weight, 0)
  return Math.round(weightedSum / totalWeight)
}
