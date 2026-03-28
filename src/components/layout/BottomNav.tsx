import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, GitCompare, RefreshCw, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import LoginDialog from '@/components/auth/LoginDialog'

const navLinkClass = (active: boolean) =>
  cn(
    'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
    active ? 'text-[#05111e]' : 'text-muted-foreground hover:text-foreground',
  )

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { compareIds } = useUIStore()
  const { user } = useAuthStore()
  const { signOut, syncData } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncData()
      toast.success('同期しました')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`同期に失敗しました: ${msg}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleUserClick = () => {
    if (window.confirm('ログアウトしますか？')) {
      signOut()
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? ''

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{ background: 'rgba(251, 249, 250, 0.88)', backdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center px-2">
          <Link to="/" className={navLinkClass(location.pathname === '/')}>
            <Home size={20} />
            一覧
          </Link>

          <button
            type="button"
            onClick={() => navigate('/compare')}
            className={navLinkClass(location.pathname === '/compare')}
          >
            <span className="relative">
              <GitCompare size={20} />
              {compareIds.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {compareIds.length}
                </span>
              )}
            </span>
            比較
          </button>

          {user ? (
            <>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className={cn(navLinkClass(false), 'disabled:opacity-50')}
              >
                <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
                同期
              </button>
              <button
                type="button"
                onClick={handleUserClick}
                title={`${user.email}（クリックでログアウト）`}
                className={navLinkClass(false)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#05111e] text-xs font-bold text-white">
                  {userInitial}
                </span>
                アカウント
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className={navLinkClass(false)}
            >
              <LogIn size={20} />
              ログイン
            </button>
          )}
        </div>
      </nav>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
