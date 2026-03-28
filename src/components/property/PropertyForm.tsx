import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Banknote,
  Calendar,
  Maximize2,
  Building2,
  FileText,
  Home,
  Trees,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  PROPERTY_TYPE_LABEL,
  PROPERTY_STATUS_LABEL,
  type PropertyType,
  type PropertyStatus,
  type Property,
} from '@/types'
import { cn } from '@/lib/utils'

const rawSchema = z.object({
  name: z.string().min(1, '物件名は必須です').max(50, '50文字以内で入力してください'),
  type: z.enum(['land', 'built'] as const),
  status: z.enum(['considering', 'visited', 'rejected', 'contracted'] as const),
  address: z.string(),
  price: z.string(),
  landArea: z.string(),
  buildingArea: z.string(),
  visitDate: z.string(),
  memo: z.string(),
})

type RawFormValues = z.infer<typeof rawSchema>

export interface PropertyFormValues {
  name: string
  type: PropertyType
  status: PropertyStatus
  address: string
  price: number | null
  landArea: number | null
  buildingArea: number | null
  visitDate: string
  memo: string
}

function toFormValues(raw: RawFormValues): PropertyFormValues {
  return {
    ...raw,
    price: raw.price === '' ? null : Number(raw.price),
    landArea: raw.landArea === '' ? null : Number(raw.landArea),
    buildingArea: raw.buildingArea === '' ? null : Number(raw.buildingArea),
  }
}

interface PropertyFormProps {
  defaultValues?: Partial<Property>
  onSubmit: (data: PropertyFormValues) => void | Promise<void>
  isSubmitting?: boolean
}

const TYPE_CONFIG: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: 'land', label: '土地', icon: <Trees size={15} /> },
  { value: 'built', label: '建売', icon: <Home size={15} /> },
]

const STATUS_CONFIG: { value: PropertyStatus; label: string; color: string; active: string }[] = [
  { value: 'considering', label: '検討中', color: 'border-blue-300 text-blue-700', active: 'bg-blue-500 border-blue-500 text-white' },
  { value: 'visited',     label: '訪問済み', color: 'border-green-300 text-green-700', active: 'bg-green-500 border-green-500 text-white' },
  { value: 'rejected',    label: '見送り',  color: 'border-gray-300 text-gray-600',  active: 'bg-gray-500 border-gray-500 text-white' },
  { value: 'contracted',  label: '契約済み', color: 'border-purple-300 text-purple-700', active: 'bg-purple-500 border-purple-500 text-white' },
]

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
      </div>
      <div className="p-4 space-y-5">{children}</div>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export default function PropertyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RawFormValues>({
    resolver: zodResolver(rawSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? 'land',
      status: defaultValues?.status ?? 'considering',
      address: defaultValues?.address ?? '',
      price: defaultValues?.price?.toString() ?? '',
      landArea: defaultValues?.landArea?.toString() ?? '',
      buildingArea: defaultValues?.buildingArea?.toString() ?? '',
      visitDate: defaultValues?.visitDate ?? '',
      memo: defaultValues?.memo ?? '',
    },
  })

  const propertyType = watch('type')
  const propertyStatus = watch('status')

  const handleFormSubmit = (raw: RawFormValues) => {
    onSubmit(toFormValues(raw))
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

      {/* 基本情報 */}
      <SectionCard title="基本情報" icon={<FileText size={14} />}>
        <FieldRow label="物件名 *">
          <Input
            {...register('name')}
            placeholder="例: ○○丁目の土地"
            className={cn('h-12 px-3 text-base', errors.name && 'border-destructive')}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </FieldRow>

        <FieldRow label="種別 *">
          <div className="flex gap-2">
            {TYPE_CONFIG.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('type', value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-base font-medium transition-all',
                  propertyType === value
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="ステータス">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_CONFIG.map(({ value, label, color, active }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('status', value)}
                className={cn(
                  'rounded-lg border py-3 text-sm font-medium transition-all',
                  propertyStatus === value ? active : cn('bg-background', color, 'hover:opacity-80'),
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FieldRow>
      </SectionCard>

      {/* 場所と価格 */}
      <SectionCard title="場所と価格" icon={<MapPin size={14} />}>
        <FieldRow label="住所">
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              {...register('address')}
              placeholder="例: 東京都渋谷区..."
              className="h-12 pl-10 text-base"
            />
          </div>
        </FieldRow>

        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="価格（万円）">
            <div className="relative">
              <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="number"
                {...register('price')}
                placeholder="3500"
                className="h-12 pl-10 text-base"
              />
            </div>
          </FieldRow>
          <FieldRow label="訪問日">
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                {...register('visitDate')}
                className="h-12 pl-10 text-base"
              />
            </div>
          </FieldRow>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="土地面積（m²）">
            <div className="relative">
              <Maximize2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="number"
                step="0.01"
                {...register('landArea')}
                placeholder="100"
                className="h-12 pl-10 text-base"
              />
            </div>
          </FieldRow>
          {propertyType === 'built' && (
            <FieldRow label="建物面積（m²）">
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  step="0.01"
                  {...register('buildingArea')}
                  placeholder="80"
                  className="h-12 pl-10 text-base"
                />
              </div>
            </FieldRow>
          )}
        </div>
      </SectionCard>

      {/* メモ */}
      <SectionCard title="メモ" icon={<FileText size={14} />}>
        <Textarea
          {...register('memo')}
          placeholder="気になった点、周辺環境の印象など自由に記録..."
          rows={4}
          className="resize-none border-0 p-0 shadow-none focus-visible:ring-0 text-base"
        />
      </SectionCard>

      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? '保存中...' : '保存する'}
      </Button>
    </form>
  )
}
