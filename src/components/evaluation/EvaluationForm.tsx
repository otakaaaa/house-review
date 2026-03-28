import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ScoreDisplay from './ScoreDisplay'
import EvaluationAxisRow from './EvaluationAxisRow'
import type { FlatEvaluationAxis } from '@/types'

interface EvaluationFormProps {
  axes: FlatEvaluationAxis[]
  onChange: (axes: FlatEvaluationAxis[]) => void
}

export default function EvaluationForm({ axes, onChange }: EvaluationFormProps) {
  const [newAxisName, setNewAxisName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = axes.findIndex((a) => a.id === active.id)
    const newIndex = axes.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(axes, oldIndex, newIndex).map((a, i) => ({
      ...a,
      order: i,
    }))
    onChange(reordered)
  }

  const handleChange = (updated: FlatEvaluationAxis) => {
    onChange(axes.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDelete = (id: string) => {
    onChange(axes.filter((a) => a.id !== id))
  }

  const handleAdd = () => {
    const name = newAxisName.trim()
    if (!name) return
    const newAxis: FlatEvaluationAxis = {
      id: uuidv4(),
      name,
      weight: 3,
      rating: null,
      comment: '',
      order: axes.length,
    }
    onChange([...axes, newAxis])
    setNewAxisName('')
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur py-3 border-b">
        <ScoreDisplay axes={axes} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={axes.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {axes.map((axis) => (
              <EvaluationAxisRow
                key={axis.id}
                axis={axis}
                onChange={handleChange}
                onDelete={() => handleDelete(axis.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <Input
          value={newAxisName}
          onChange={(e) => setNewAxisName(e.target.value)}
          placeholder="評価軸を追加"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button type="button" variant="outline" size="icon" onClick={handleAdd}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}
