import { EVALUATION_RATING_LABEL, type EvaluationRating } from '@/types'
import { cn } from '@/lib/utils'

const RATINGS: EvaluationRating[] = ['best', 'good', 'average', 'compromise', 'dislike']

const RATING_STYLE: Record<EvaluationRating, string> = {
  best: 'bg-green-500 text-white border-green-500',
  good: 'bg-blue-500 text-white border-blue-500',
  average: 'bg-yellow-500 text-white border-yellow-500',
  compromise: 'bg-orange-500 text-white border-orange-500',
  dislike: 'bg-red-500 text-white border-red-500',
}

interface RatingSelectorProps {
  value: EvaluationRating | null
  onChange: (rating: EvaluationRating | null) => void
}

export default function RatingSelector({ value, onChange }: RatingSelectorProps) {
  const handleClick = (rating: EvaluationRating) => {
    onChange(value === rating ? null : rating)
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {RATINGS.map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          className={cn(
            'shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
            value === rating
              ? RATING_STYLE[rating]
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
          )}
        >
          {EVALUATION_RATING_LABEL[rating]}
        </button>
      ))}
    </div>
  )
}
