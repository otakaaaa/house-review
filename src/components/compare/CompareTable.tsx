import { EVALUATION_RATING_LABEL, PROPERTY_TYPE_LABEL, type Property } from '@/types'
import { RATING_SCORE } from '@/lib/scoring'
import { cn } from '@/lib/utils'

interface CompareTableProps {
  properties: Property[]
}

const SCORE_COLOR = (score: number | null) => {
  if (score === null) return 'text-muted-foreground'
  if (score >= 75) return 'text-green-600 font-semibold'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const RATING_COLOR = (score: number) => {
  if (score >= 75) return 'text-green-700'
  if (score >= 50) return 'text-yellow-700'
  return 'text-red-700'
}

export default function CompareTable({ properties }: CompareTableProps) {
  const allAxisNames = Array.from(
    new Set(
      properties.flatMap((p) => p.evaluationAxes.map((a) => a.name)),
    ),
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background min-w-32 border-b px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              評価軸
            </th>
            {properties.map((p) => (
              <th
                key={p.id}
                className="min-w-28 border-b px-3 py-2 text-left text-xs font-medium"
              >
                <div>{p.name}</div>
                <div className="text-muted-foreground font-normal">
                  {PROPERTY_TYPE_LABEL[p.type]}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-muted/50">
            <td className="sticky left-0 bg-muted/50 border-b px-3 py-2 text-xs font-medium">
              総合スコア
            </td>
            {properties.map((p) => (
              <td
                key={p.id}
                className={cn('border-b px-3 py-2 text-base', SCORE_COLOR(p.totalScore))}
              >
                {p.totalScore !== null ? `${p.totalScore}点` : '未評価'}
              </td>
            ))}
          </tr>
          {allAxisNames.map((axisName) => (
            <tr key={axisName} className="hover:bg-muted/30">
              <td className="sticky left-0 bg-background hover:bg-muted/30 border-b px-3 py-2 text-xs text-muted-foreground">
                {axisName}
              </td>
              {properties.map((p) => {
                const axis = p.evaluationAxes.find((a) => a.name === axisName)
                return (
                  <td key={p.id} className="border-b px-3 py-2">
                    {axis?.rating ? (
                      <div>
                        <span
                          className={cn(
                            'text-xs',
                            RATING_COLOR(RATING_SCORE[axis.rating]),
                          )}
                        >
                          {EVALUATION_RATING_LABEL[axis.rating]}
                        </span>
                        {axis.comment && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {axis.comment}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
