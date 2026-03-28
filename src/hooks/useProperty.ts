import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { pushProperty, deletePropertyFromCloud } from '@/lib/sync'
import { calcTotalScore } from '@/lib/scoring'
import { useAuthStore } from '@/store/authStore'
import type { Property, EvaluationAxis } from '@/types'

type CreatePropertyInput = Omit<
  Property,
  'id' | 'totalScore' | 'evaluationAxes' | 'createdAt' | 'updatedAt' | '_synced'
>

type UpdatePropertyInput = Partial<
  Omit<Property, 'id' | 'totalScore' | 'createdAt' | 'updatedAt' | '_synced'>
>

export function useProperty() {
  const createProperty = useCallback(async (input: CreatePropertyInput): Promise<string> => {
    const now = new Date().toISOString()
    const id = uuidv4()
    const property: Property = {
      ...input,
      id,
      evaluationAxes: [],
      totalScore: null,
      createdAt: now,
      updatedAt: now,
      _synced: false,
    }
    await db.properties.add(property)

    const user = useAuthStore.getState().user
    if (user) {
      pushProperty(property, user.id)
        .then(() => db.properties.update(id, { _synced: true }))
        .catch(() => toast.error('クラウドへの同期に失敗しました'))
    }

    return id
  }, [])

  const updateProperty = useCallback(async (
    id: string,
    input: UpdatePropertyInput,
  ): Promise<void> => {
    const existing = await db.properties.get(id)
    if (!existing) return

    const axes: EvaluationAxis[] = input.evaluationAxes ?? existing.evaluationAxes
    const totalScore = calcTotalScore(axes)
    const updatedAt = new Date().toISOString()

    await db.properties.update(id, {
      ...input,
      totalScore,
      updatedAt,
      _synced: false,
    })

    const user = useAuthStore.getState().user
    if (user) {
      const updated = await db.properties.get(id)
      if (updated) {
        pushProperty(updated, user.id)
          .then(() => db.properties.update(id, { _synced: true }))
          .catch(() => toast.error('クラウドへの同期に失敗しました'))
      }
    }
  }, [])

  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    await db.properties.delete(id)

    const user = useAuthStore.getState().user
    if (user) {
      deletePropertyFromCloud(id).catch(() => toast.error('クラウドからの削除に失敗しました'))
    }
  }, [])

  const getProperty = useCallback(async (id: string): Promise<Property | undefined> => {
    return db.properties.get(id)
  }, [])

  return { createProperty, updateProperty, deleteProperty, getProperty }
}
