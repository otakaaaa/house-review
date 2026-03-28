import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { calcTotalScore } from '@/lib/scoring'
import type { Property, EvaluationAxis } from '@/types'

type CreatePropertyInput = Omit<
  Property,
  'id' | 'totalScore' | 'evaluationAxes' | 'createdAt' | 'updatedAt'
>

type UpdatePropertyInput = Partial<
  Omit<Property, 'id' | 'totalScore' | 'createdAt' | 'updatedAt'>
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
    }
    await db.properties.add(property)
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

    await db.properties.update(id, {
      ...input,
      totalScore,
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    await db.properties.delete(id)
  }, [])

  const getProperty = useCallback(async (id: string): Promise<Property | undefined> => {
    return db.properties.get(id)
  }, [])

  return { createProperty, updateProperty, deleteProperty, getProperty }
}
