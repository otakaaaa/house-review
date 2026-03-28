import { useCallback } from 'react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { pushAxisTemplate } from '@/lib/sync'
import { useAuthStore } from '@/store/authStore'
import type { AxisTemplate, PropertyType } from '@/types'

export function useAxisTemplates() {
  const getTemplate = useCallback(async (type: PropertyType): Promise<AxisTemplate[] | null> => {
    const record = await db.axisTemplates.get(type)
    return record?.axes ?? null
  }, [])

  const saveTemplate = useCallback(async (type: PropertyType, axes: AxisTemplate[]): Promise<void> => {
    await db.axisTemplates.put({ type, axes })

    const user = useAuthStore.getState().user
    if (user) {
      pushAxisTemplate(type, axes, user.id).catch(() =>
        toast.error('クラウドへの同期に失敗しました'),
      )
    }
  }, [])

  return { getTemplate, saveTemplate }
}
