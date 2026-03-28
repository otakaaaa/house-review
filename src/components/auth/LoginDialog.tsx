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

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

type FormValues = z.infer<typeof schema>

type SendState = 'idle' | 'sending' | 'sent'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn } = useAuth()
  const [sendState, setSendState] = useState<SendState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormValues) => {
    setSendState('sending')
    setErrorMessage(null)
    try {
      await signIn(email)
      setSendState('sent')
    } catch {
      setErrorMessage('送信に失敗しました。しばらくしてから再試行してください。')
      setSendState('idle')
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSendState('idle')
      setErrorMessage(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ログイン</DialogTitle>
          <DialogDescription>
            メールアドレスにログインリンクを送信します
          </DialogDescription>
        </DialogHeader>

        {sendState === 'sent' ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-sm font-medium">メールを送信しました</p>
            <p className="text-xs text-muted-foreground">
              受信ボックスを確認し、リンクをクリックしてログインしてください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={sendState === 'sending'}>
              {sendState === 'sending' ? '送信中...' : 'ログインリンクを送信'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
