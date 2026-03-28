import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { signOut } = useAuth()
  const { user } = useAuthStore()

  const handleLogout = () => {
    signOut()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>ログアウト</DialogTitle>
          <DialogDescription>
            {user?.email} からログアウトしますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            キャンセル
          </DialogClose>
          <Button variant="destructive" onClick={handleLogout} size="lg">
            ログアウト
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
