import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-black/5"
      style={{ background: 'rgba(251, 249, 250, 0.88)', backdropFilter: 'blur(20px)' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div>
          <Link
            to="/"
            className="text-base font-bold tracking-tight text-[#1b1b1d]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            物件メモ
          </Link>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            物件評価アプリ
          </p>
        </div>
        <Link
          to="/properties/new"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'gap-1.5 rounded-full px-4 bg-[#05111e] hover:bg-[#0a1f33] text-white border-0',
          )}
        >
          <Plus size={14} />
          新規登録
        </Link>
      </div>
    </header>
  )
}
