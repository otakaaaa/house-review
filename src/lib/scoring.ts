import type {
  EvaluationAxis,
  EvaluationRating,
  EvaluatorEntry,
  EvaluatorId,
  FlatEvaluationAxis,
} from '@/types'

export const RATING_SCORE: Record<EvaluationRating, number> = {
  best: 100,
  good: 75,
  average: 50,
  compromise: 25,
  dislike: 0,
}

function calcFlatScore(axes: FlatEvaluationAxis[]): number | null {
  const rated = axes.filter((a) => a.rating !== null)
  if (rated.length === 0) return null
  const weightedSum = rated.reduce(
    (acc, a) => acc + RATING_SCORE[a.rating!] * a.weight,
    0,
  )
  const totalWeight = rated.reduce((acc, a) => acc + a.weight, 0)
  return Math.round(weightedSum / totalWeight)
}

/** 特定評価者向けにフラット化した軸リストを返す */
export function flattenForEvaluator(
  axes: EvaluationAxis[],
  evaluatorId: EvaluatorId,
): FlatEvaluationAxis[] {
  return axes.map((a) => {
    const entry = a.evaluations.find((e) => e.evaluatorId === evaluatorId)
    return {
      id: a.id,
      name: a.name,
      weight: a.weight,
      order: a.order,
      rating: entry?.rating ?? null,
      comment: entry?.comment ?? '',
    }
  })
}

/**
 * EvaluationForm の変更（FlatEvaluationAxis[]）を EvaluationAxis[] に反映する。
 * - 軸の追加・削除・並び替え・重み変更は全評価者に適用
 * - rating/comment は activeEvaluator のエントリのみ更新
 */
export function applyFlatChanges(
  axes: EvaluationAxis[],
  flatAxes: FlatEvaluationAxis[],
  evaluatorId: EvaluatorId,
): EvaluationAxis[] {
  const existingMap = new Map(axes.map((a) => [a.id, a]))

  return flatAxes.map((flat) => {
    const existing = existingMap.get(flat.id)
    const myEntry: EvaluatorEntry = {
      evaluatorId,
      rating: flat.rating,
      comment: flat.comment,
    }

    if (existing) {
      const otherEvals = existing.evaluations.filter((e) => e.evaluatorId !== evaluatorId)
      return {
        ...existing,
        weight: flat.weight,
        order: flat.order,
        evaluations: [...otherEvals, myEntry],
      }
    }

    // 新規追加された軸
    return {
      id: flat.id,
      name: flat.name,
      weight: flat.weight,
      order: flat.order,
      evaluations: [myEntry],
    }
  })
}

/** 特定評価者のスコアを計算 */
export function calcScoreForEvaluator(
  axes: EvaluationAxis[],
  evaluatorId: EvaluatorId,
): number | null {
  return calcFlatScore(flattenForEvaluator(axes, evaluatorId))
}

/** 全評価者スコアの平均（総合スコア） */
export function calcTotalScore(axes: EvaluationAxis[]): number | null {
  const evaluatorIds: EvaluatorId[] = ['self', 'spouse']
  const scores = evaluatorIds
    .map((id) => calcScoreForEvaluator(axes, id))
    .filter((s): s is number => s !== null)
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}
