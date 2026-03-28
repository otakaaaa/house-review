import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useUIStore } from '@/store/uiStore'
import type { Property } from '@/types'

export function useCompare() {
  const { compareIds } = useUIStore()

  const properties = useLiveQuery(async (): Promise<Property[]> => {
    if (compareIds.length === 0) return []
    const results = await db.properties.bulkGet(compareIds)
    return results.filter((p): p is Property => p !== undefined)
  }, [compareIds])

  return { properties: properties ?? [], compareIds }
}
