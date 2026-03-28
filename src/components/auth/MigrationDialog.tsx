import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { migrateLocalData } from '@/lib/sync'

const MIGRATION_ASKED_KEY = 'migration_asked'

export function markMigrationAsked(): void {
  localStorage.setItem(MIGRATION_ASKED_KEY, 'true')
}

export function isMigrationAsked(): boolean {
  return localStorage.getItem(MIGRATION_ASKED_KEY) === 'true'
}

interface MigrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  localCount: number
}

export default function MigrationDialog({
  open,
  onOpenChange,
  userId,
  localCount,
}: MigrationDialogProps) {
  const [migrating, setMigrating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      await migrateLocalData(userId, (current, total) => {
        setProgress({ current, total })
      })
      markMigrationAsked()
      toast.success('データをクラウドに移行しました')
      onOpenChange(false)
    } catch {
      toast.error('移行に失敗しました。再度お試しください。')
    } finally {
      setMigrating(false)
    }
  }

  const handleSkip = () => {
    markMigrationAsked()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!migrating) onOpenChange(next) }}>
      <DialogContent showCloseButton={!migrating}>
        <DialogHeader>
          <DialogTitle>ローカルデータをクラウドに移行</DialogTitle>
          <DialogDescription>
            {localCount} 件の物件データがローカルに保存されています。
            クラウドに移行すると他のデバイスからも閲覧・編集できます。
          </DialogDescription>
        </DialogHeader>

        {migrating && (
          <div className="space-y-2 py-2">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: progress.total > 0
                    ? `${(progress.current / progress.total) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {progress.current} / {progress.total} 件移行中...
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={migrating}>
            あとで
          </Button>
          <Button onClick={handleMigrate} disabled={migrating}>
            {migrating ? '移行中...' : '今すぐ移行'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
