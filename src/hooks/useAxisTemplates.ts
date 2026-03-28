import { useCallback } from 'react'
import { db } from '@/lib/db'
import type { AxisTemplate, PropertyType } from '@/types'

export function useAxisTemplates() {
  const getTemplate = useCallback(async (type: PropertyType): Promise<AxisTemplate[] | null> => {
    const record = await db.axisTemplates.get(type)
    return record?.axes ?? null
  }, [])

  const saveTemplate = useCallback(async (type: PropertyType, axes: AxisTemplate[]): Promise<void> => {
    await db.axisTemplates.put({ type, axes })
  }, [])

  return { getTemplate, saveTemplate }
}
