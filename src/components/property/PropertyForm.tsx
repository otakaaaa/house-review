import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PROPERTY_TYPE_LABEL,
  PROPERTY_STATUS_LABEL,
  type PropertyType,
  type PropertyStatus,
  type Property,
} from '@/types'

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
      <div className="space-y-2">
        <Label htmlFor="name">物件名 *</Label>
        <Input id="name" {...register('name')} placeholder="例: ○○丁目の土地" />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>種別 *</Label>
          <Select
            value={propertyType}
            onValueChange={(v) => setValue('type', v as PropertyType)}
          >
            <SelectTrigger>
              <SelectValue>{PROPERTY_TYPE_LABEL[propertyType]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>ステータス</Label>
          <Select
            value={propertyStatus}
            onValueChange={(v) => setValue('status', v as PropertyStatus)}
          >
            <SelectTrigger>
              <SelectValue>{PROPERTY_STATUS_LABEL[propertyStatus]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROPERTY_STATUS_LABEL) as PropertyStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {PROPERTY_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">住所</Label>
        <Input id="address" {...register('address')} placeholder="例: 東京都渋谷区..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="price">価格（万円）</Label>
          <Input id="price" type="number" {...register('price')} placeholder="3500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visitDate">訪問日</Label>
          <Input id="visitDate" type="date" {...register('visitDate')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="landArea">土地面積（m²）</Label>
          <Input
            id="landArea"
            type="number"
            step="0.01"
            {...register('landArea')}
            placeholder="100"
          />
        </div>
        {propertyType === 'built' && (
          <div className="space-y-2">
            <Label htmlFor="buildingArea">建物面積（m²）</Label>
            <Input
              id="buildingArea"
              type="number"
              step="0.01"
              {...register('buildingArea')}
              placeholder="80"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">メモ</Label>
        <Textarea
          id="memo"
          {...register('memo')}
          placeholder="気になった点など自由に記録..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存する'}
      </Button>
    </form>
  )
}
