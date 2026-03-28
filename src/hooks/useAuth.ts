import { useEffect } from 'react'
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
        pullAll(session.user.id).catch(() => {})
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (event === 'SIGNED_IN' && session?.user) {
        pullAll(session.user.id).catch(() => {})
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  const signIn = async (email: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const signOut = async (): Promise<void> => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return { signIn, signOut }
}
