import Dexie, { type Table } from 'dexie'
import type { AxisTemplateRecord, Property } from '@/types'

class HouseReviewDB extends Dexie {
  properties!: Table<Property>
  axisTemplates!: Table<AxisTemplateRecord>

  constructor() {
    super('house-review')
    this.version(1).stores({
      properties: 'id, type, status, visitDate, totalScore, createdAt',
    })
    this.version(2).stores({
      properties: 'id, type, status, visitDate, totalScore, createdAt',
      axisTemplates: 'type',
    })
    this.version(3).stores({
      properties: 'id, type, status, visitDate, totalScore, createdAt',
      axisTemplates: 'type',
    }).upgrade((tx) => {
      return tx.table('properties').toCollection().modify({ _synced: true })
    })
  }
}

export const db = new HouseReviewDB()
