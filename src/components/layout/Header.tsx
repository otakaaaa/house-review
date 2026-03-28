import { Link, useLocation } from 'react-router-dom'
import { Home, GitCompare } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export default function Header() {
  const location = useLocation()
  const { compareIds } = useUIStore()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight">
          物件メモ
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Home size={16} />
            一覧
          </Link>
          <Link
            to="/compare"
            className={cn(
              'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
              location.pathname === '/compare'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <GitCompare size={16} />
            比較
            {compareIds.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {compareIds.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
