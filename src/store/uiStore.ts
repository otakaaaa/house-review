import { create } from 'zustand'
import type { PropertyType, PropertyStatus } from '@/types'

type SortKey = 'totalScore' | 'visitDate' | 'price'
type SortOrder = 'asc' | 'desc'

interface UIState {
  filterType: PropertyType | 'all'
  filterStatus: PropertyStatus | 'all'
  sortKey: SortKey
  sortOrder: SortOrder
  compareIds: string[]
  setFilterType: (type: PropertyType | 'all') => void
  setFilterStatus: (status: PropertyStatus | 'all') => void
  setSort: (key: SortKey, order: SortOrder) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
}

export const useUIStore = create<UIState>((set) => ({
  filterType: 'all',
  filterStatus: 'all',
  sortKey: 'createdAt' as SortKey,
  sortOrder: 'desc',
  compareIds: [],
  setFilterType: (type) => set({ filterType: type }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSort: (key, order) => set({ sortKey: key, sortOrder: order }),
  toggleCompare: (id) =>
    set((state) => ({
      compareIds: state.compareIds.includes(id)
        ? state.compareIds.filter((cid) => cid !== id)
        : [...state.compareIds, id],
    })),
  clearCompare: () => set({ compareIds: [] }),
}))
