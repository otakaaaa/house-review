import Dexie, { type Table } from 'dexie'
import type { Property } from '@/types'

class HouseReviewDB extends Dexie {
  properties!: Table<Property>

  constructor() {
    super('house-review')
    this.version(1).stores({
      properties: 'id, type, status, visitDate, totalScore, createdAt',
    })
  }
}

export const db = new HouseReviewDB()
