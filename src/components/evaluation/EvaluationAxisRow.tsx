import { useState } from 'react'
import { GripVertical, ChevronDown, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import RatingSelector from './RatingSelector'
import WeightSlider from './WeightSlider'
import type { FlatEvaluationAxis, EvaluationRating } from '@/types'
import { cn } from '@/lib/utils'

interface EvaluationAxisRowProps {
  axis: FlatEvaluationAxis
  onChange: (updated: FlatEvaluationAxis) => void
  onDelete: () => void
}

export default function EvaluationAxisRow({
  axis,
  onChange,
  onDelete,
}: EvaluationAxisRowProps) {
  const [weightOpen, setWeightOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: axis.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleRating = (rating: EvaluationRating | null) => {
    onChange({ ...axis, rating })
  }

  const handleComment = (comment: string) => {
    onChange({ ...axis, comment })
  }

  const handleWeight = (weight: number) => {
    onChange({ ...axis, weight })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-3 space-y-2 transition-shadow',
        isDragging && 'shadow-lg opacity-80',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground touch-none"
          aria-label="並び替え"
        >
          <GripVertical size={16} />
        </button>
        <span className="flex-1 text-sm font-medium">{axis.name}</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="削除"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <RatingSelector value={axis.rating} onChange={handleRating} />

      <Input
        value={axis.comment}
        onChange={(e) => handleComment(e.target.value)}
        placeholder="コメント（任意）"
        className="h-8 text-sm"
      />

      <button
        type="button"
        onClick={() => setWeightOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          size={12}
          className={cn('transition-transform', weightOpen && 'rotate-180')}
        />
        重み設定
      </button>

      {weightOpen && (
        <div className="pl-4">
          <WeightSlider value={axis.weight} onChange={handleWeight} />
        </div>
      )}
    </div>
  )
}
