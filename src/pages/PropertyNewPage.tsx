import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import PropertyForm, { type PropertyFormValues } from '@/components/property/PropertyForm'
import PhotoUploader from '@/components/property/PhotoUploader'
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
        <div className="py-4 space-y-5">

          {/* ページヘッダー */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold leading-tight">物件を登録</h1>
              <p className="text-xs text-muted-foreground">評価は登録後にいつでも入力できます</p>
            </div>
          </div>

          {/* 写真セクション */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <ImagePlus size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">写真</span>
            </div>
            <div className="p-4">
              <PhotoUploader photos={photos} onChange={setPhotos} />
            </div>
          </div>

          {/* フォーム */}
          <PropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        </div>
      </Layout>
    </>
  )
}
