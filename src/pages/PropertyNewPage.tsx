import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import PropertyForm, { type PropertyFormValues } from '@/components/property/PropertyForm'
import PhotoUploader from '@/components/property/PhotoUploader'
import { Separator } from '@/components/ui/separator'
import { useProperty } from '@/hooks/useProperty'
import type { Photo } from '@/types'

export default function PropertyNewPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProperty } = useProperty()
  const navigate = useNavigate()

  const handleSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true)
    try {
      const id = await createProperty({ ...data, photos })
      toast.success('物件を登録しました')
      navigate(`/properties/${id}`)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-6">
          <h1 className="text-xl font-bold">物件を登録</h1>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              写真
            </h2>
            <PhotoUploader photos={photos} onChange={setPhotos} />
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              基本情報
            </h2>
            <PropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </Layout>
    </>
  )
}
