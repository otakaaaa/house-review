import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, GitCompare, LogIn } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import LoginDialog from '@/components/auth/LoginDialog'

export default function Header() {
  const location = useLocation()
  const { compareIds } = useUIStore()
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const handleUserClick = () => {
    if (window.confirm('ログアウトしますか？')) {
      signOut()
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? ''

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

          {user ? (
            <button
              type="button"
              onClick={handleUserClick}
              title={`${user.email}（クリックでログアウト）`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              {userInitial}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogIn size={16} />
              ログイン
            </button>
          )}
        </nav>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  )
}
