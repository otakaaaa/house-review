import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { pullAll } from '@/lib/sync'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        pullAll(session.user.id).catch((err) => {
          const msg = err instanceof Error ? err.message : String(err)
          toast.error(`データの同期に失敗しました: ${msg}`)
        })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (event === 'SIGNED_IN' && session?.user) {
        pullAll(session.user.id).catch((err) => {
          const msg = err instanceof Error ? err.message : String(err)
          toast.error(`データの同期に失敗しました: ${msg}`)
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  const signInWithOtp = async (email: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const signInWithPassword = async (email: string, password: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async (): Promise<void> => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const syncData = async (): Promise<void> => {
    const { user } = useAuthStore.getState()
    if (!user) return
    await pullAll(user.id)
  }

  return { signInWithOtp, signInWithPassword, signOut, syncData }
}
