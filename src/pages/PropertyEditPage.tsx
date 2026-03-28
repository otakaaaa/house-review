import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/layout/Layout'
import Header from '@/components/layout/Header'
import PropertyForm, { type PropertyFormValues } from '@/components/property/PropertyForm'
import PhotoUploader from '@/components/property/PhotoUploader'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperty } from '@/hooks/useProperty'
import type { Photo, Property } from '@/types'

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProperty, updateProperty } = useProperty()
  const [property, setProperty] = useState<Property | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    getProperty(id).then((p) => {
      if (p) {
        setProperty(p)
        setPhotos(p.photos)
      }
      setLoading(false)
    })
  }, [id, getProperty])

  const handleSubmit = async (data: PropertyFormValues) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateProperty(id, { ...data, photos })
      toast.success('物件情報を更新しました')
      navigate(`/properties/${id}`)
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <Layout>
          <div className="py-4 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Layout>
      </>
    )
  }

  if (!property) {
    return (
      <>
        <Header />
        <Layout>
          <div className="py-16 text-center space-y-3">
            <p className="text-muted-foreground">物件が見つかりません</p>
            <Link to="/" className={buttonVariants({ variant: 'outline' })}>
              一覧に戻る
            </Link>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Header />
      <Layout>
        <div className="py-4 space-y-6">
          <h1 className="text-xl font-bold">物件情報を編集</h1>

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
            <PropertyForm
              defaultValues={property}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </Layout>
    </>
  )
}
