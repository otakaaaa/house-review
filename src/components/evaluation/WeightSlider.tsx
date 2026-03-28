import { cn } from '@/lib/utils'

interface WeightSliderProps {
  value: number
  onChange: (weight: number) => void
}

export default function WeightSlider({ value, onChange }: WeightSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-8">重み</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onChange(w)}
            className={cn(
              'h-4 w-4 rounded-full border transition-colors',
              w <= value
                ? 'bg-primary border-primary'
                : 'border-border bg-background',
            )}
            aria-label={`重み${w}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value}/5</span>
    </div>
  )
}
