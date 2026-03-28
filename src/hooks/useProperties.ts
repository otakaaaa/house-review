import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useUIStore } from '@/store/uiStore'
import type { Property } from '@/types'

export function useProperties() {
  const { filterType, filterStatus, sortKey, sortOrder } = useUIStore()

  const properties = useLiveQuery(async (): Promise<Property[]> => {
    let query = db.properties.toCollection()

    if (filterType !== 'all') {
      query = db.properties.where('type').equals(filterType)
    }

    const all = await query.toArray()

    const filtered =
      filterStatus === 'all'
        ? all
        : all.filter((p) => p.status === filterStatus)

    return filtered.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1
      if (sortKey === 'totalScore') {
        return ((a.totalScore ?? -1) - (b.totalScore ?? -1)) * dir
      }
      if (sortKey === 'visitDate') {
        const aDate = a.visitDate ?? ''
        const bDate = b.visitDate ?? ''
        return aDate.localeCompare(bDate) * dir
      }
      if (sortKey === 'price') {
        return ((a.price ?? 0) - (b.price ?? 0)) * dir
      }
      return a.createdAt.localeCompare(b.createdAt) * dir
    })
  }, [filterType, filterStatus, sortKey, sortOrder])

  return { properties: properties ?? [] }
}
