import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

const passwordSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

const otpSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
})

type PasswordFormValues = z.infer<typeof passwordSchema>
type OtpFormValues = z.infer<typeof otpSchema>
type Mode = 'password' | 'otp'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signInWithPassword, signInWithOtp } = useAuth()
  const [mode, setMode] = useState<Mode>('password')
  const [submitting, setSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  })

  const handlePasswordSubmit = async ({ email, password }: PasswordFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await signInWithPassword(email, password)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(msg || 'メールアドレスまたはパスワードが正しくありません。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpSubmit = async ({ email }: OtpFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await signInWithOtp(email)
      setOtpSent(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(msg || '送信に失敗しました。しばらくしてから再試行してください。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMode('password')
      setSubmitting(false)
      setOtpSent(false)
      setErrorMessage(null)
      passwordForm.reset()
      otpForm.reset()
    }
    onOpenChange(next)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrorMessage(null)
    setOtpSent(false)
    passwordForm.reset()
    otpForm.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ログイン</DialogTitle>
          <DialogDescription>
            {mode === 'password'
              ? 'メールアドレスとパスワードでログインします'
              : 'メールアドレスにログインリンクを送信します'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...passwordForm.register('email')}
              />
              {passwordForm.formState.errors.email && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...passwordForm.register('password')}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'ログイン中...' : 'ログイン'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              パスワードを忘れた場合は{' '}
              <button
                type="button"
                onClick={() => switchMode('otp')}
                className="underline hover:text-foreground"
              >
                マジックリンクでログイン
              </button>
            </p>
          </form>
        )}

        {mode === 'otp' && (
          <>
            {otpSent ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-sm font-medium">メールを送信しました</p>
                <p className="text-xs text-muted-foreground">
                  受信ボックスを確認し、リンクをクリックしてログインしてください。
                </p>
              </div>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp-email">メールアドレス</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    {...otpForm.register('email')}
                  />
                  {otpForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{otpForm.formState.errors.email.message}</p>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-xs text-destructive">{errorMessage}</p>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? '送信中...' : 'ログインリンクを送信'}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => switchMode('password')}
                    className="underline hover:text-foreground"
                  >
                    パスワードでログインに戻る
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
