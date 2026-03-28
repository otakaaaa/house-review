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
    this.version(4).stores({
      properties: 'id, type, status, visitDate, totalScore, createdAt',
      axisTemplates: 'type',
    }).upgrade((tx) => {
      return tx.table('properties').toCollection().modify((property) => {
        property.evaluationAxes = property.evaluationAxes.map(
          (axis: { id: string; name: string; weight: number; order: number; rating: string | null; comment: string }) => ({
            id: axis.id,
            name: axis.name,
            weight: axis.weight,
            order: axis.order,
            evaluations:
              axis.rating !== null || axis.comment
                ? [{ evaluatorId: 'self', rating: axis.rating, comment: axis.comment }]
                : [],
          }),
        )
      })
    })
  }
}

export const db = new HouseReviewDB()
