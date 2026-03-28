export type PropertyType = 'land' | 'built'

export type PropertyStatus = 'considering' | 'visited' | 'rejected' | 'contracted'

export type EvaluationRating = 'best' | 'good' | 'average' | 'compromise' | 'dislike'

export type EvaluatorId = 'self' | 'spouse'

export const EVALUATOR_LABEL: Record<EvaluatorId, string> = {
  self: '夫',
  spouse: '妻',
}

export interface EvaluatorEntry {
  evaluatorId: EvaluatorId
  rating: EvaluationRating | null
  comment: string
}

export interface EvaluationAxis {
  id: string
  name: string
  weight: number
  order: number
  evaluations: EvaluatorEntry[]
}

/** 単一評価者向けのフラット表現（EvaluationForm/EvaluationAxisRow で使用） */
export interface FlatEvaluationAxis {
  id: string
  name: string
  weight: number
  order: number
  rating: EvaluationRating | null
  comment: string
}

export interface AxisTemplate {
  id: string
  name: string
  weight: number
  order: number
}

export interface AxisTemplateRecord {
  type: PropertyType
  axes: AxisTemplate[]
}

export interface Photo {
  id: string
  dataUrl: string
  caption: string
}

export interface Property {
  id: string
  type: PropertyType
  name: string
  address: string
  price: number | null
  landArea: number | null
  buildingArea: number | null
  visitDate: string | null
  status: PropertyStatus
  memo: string
  photos: Photo[]
  evaluationAxes: EvaluationAxis[]
  totalScore: number | null
  createdAt: string
  updatedAt: string
  _synced?: boolean
}

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  land: '土地',
  built: '建売',
}

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  considering: '検討中',
  visited: '訪問済み',
  rejected: '見送り',
  contracted: '契約済み',
}

export const EVALUATION_RATING_LABEL: Record<EvaluationRating, string> = {
  best: '最高',
  good: '良い',
  average: '普通',
  compromise: '妥協',
  dislike: '好みじゃない',
}
