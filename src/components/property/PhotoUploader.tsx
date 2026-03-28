import { useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Input } from '@/components/ui/input'
import { resizeImage } from '@/lib/image'
import type { Photo } from '@/types'

const MAX_PHOTOS = 10

interface PhotoUploaderProps {
  photos: Photo[]
  onChange: (photos: Photo[]) => void
}

export default function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_PHOTOS - photos.length
    const targets = Array.from(files).slice(0, remaining)

    const newPhotos: Photo[] = await Promise.all(
      targets.map(async (file) => ({
        id: uuidv4(),
        dataUrl: await resizeImage(file),
        caption: '',
      })),
    )
    onChange([...photos, ...newPhotos])
  }

  const handleDelete = (id: string) => {
    onChange(photos.filter((p) => p.id !== id))
  }

  const handleCaption = (id: string, caption: string) => {
    onChange(photos.map((p) => (p.id === id ? { ...p, caption } : p)))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative space-y-1">
            <div className="relative aspect-square overflow-hidden rounded-md border">
              <img
                src={photo.dataUrl}
                alt={photo.caption || '物件写真'}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={10} />
              </button>
            </div>
            <Input
              value={photo.caption}
              onChange={(e) => handleCaption(photo.id, e.target.value)}
              placeholder="キャプション"
              className="h-7 text-xs"
            />
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        {photos.length}/{MAX_PHOTOS}枚 （タップして追加）
      </p>
    </div>
  )
}
