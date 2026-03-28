import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import type { AxisTemplate, EvaluationAxis, Photo, Property, PropertyType } from '@/types'

// ---------------------------------------------------------------------------
// Supabase 行の型（snake_case）
// ---------------------------------------------------------------------------

interface SupabasePropertyRow {
  id: string
  user_id: string
  type: string
  name: string
  address: string
  price: number | null
  land_area: number | null
  building_area: number | null
  visit_date: string | null
  status: string
  memo: string
  photos: Photo[]
  evaluation_axes: EvaluationAxis[]
  total_score: number | null
  created_at: string
  updated_at: string
}

interface SupabaseAxisTemplateRow {
  user_id: string
  type: string
  axes: AxisTemplate[]
}

// ---------------------------------------------------------------------------
// 変換関数
// ---------------------------------------------------------------------------

function toRow(property: Property, userId: string): SupabasePropertyRow {
  return {
    id: property.id,
    user_id: userId,
    type: property.type,
    name: property.name,
    address: property.address,
    price: property.price,
    land_area: property.landArea,
    building_area: property.buildingArea,
    visit_date: property.visitDate,
    status: property.status,
    memo: property.memo,
    photos: property.photos,
    evaluation_axes: property.evaluationAxes,
    total_score: property.totalScore,
    created_at: property.createdAt,
    updated_at: property.updatedAt,
  }
}

function fromRow(row: SupabasePropertyRow): Property {
  return {
    id: row.id,
    type: row.type as PropertyType,
    name: row.name,
    address: row.address,
    price: row.price,
    landArea: row.land_area,
    buildingArea: row.building_area,
    visitDate: row.visit_date,
    status: row.status as Property['status'],
    memo: row.memo,
    photos: row.photos,
    evaluationAxes: row.evaluation_axes,
    totalScore: row.total_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    _synced: true,
  }
}

// ---------------------------------------------------------------------------
// 単体プッシュ
// ---------------------------------------------------------------------------

export async function pushProperty(property: Property, userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('properties').upsert(toRow(property, userId))
  if (error) throw error
}

export async function deletePropertyFromCloud(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}

export async function pushAxisTemplate(
  type: PropertyType,
  axes: AxisTemplate[],
  userId: string,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const row: SupabaseAxisTemplateRow = { user_id: userId, type, axes }
  const { error } = await supabase.from('axis_templates').upsert(row)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// 全件プル → IndexedDB にマージ（last-write-wins）
// ---------------------------------------------------------------------------

export async function pullAll(userId: string): Promise<void> {
  if (!supabase) return
  await pullProperties(userId)
  await pullAxisTemplates(userId)
  await pushUnsynced(userId)
}

async function pullProperties(userId: string): Promise<void> {
  const { data, error } = await supabase!
    .from('properties')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  if (!data || data.length === 0) return

  const remoteRows = data as SupabasePropertyRow[]
  const localAll = await db.properties.toArray()
  const localMap = new Map(localAll.map((p) => [p.id, p]))

  for (const row of remoteRows) {
    const local = localMap.get(row.id)
    if (!local) {
      await db.properties.add(fromRow(row))
    } else if (row.updated_at > local.updatedAt) {
      await db.properties.put(fromRow(row))
    }
    // local が新しい場合はスキップ（pushUnsynced で後からプッシュ）
  }
}

async function pullAxisTemplates(userId: string): Promise<void> {
  const { data, error } = await supabase!
    .from('axis_templates')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  if (!data || data.length === 0) return

  for (const row of data as SupabaseAxisTemplateRow[]) {
    await db.axisTemplates.put({ type: row.type as PropertyType, axes: row.axes })
  }
}

async function pushUnsynced(userId: string): Promise<void> {
  const unsynced = await db.properties.filter((p) => p._synced === false).toArray()
  for (const property of unsynced) {
    try {
      await pushProperty(property, userId)
      await db.properties.update(property.id, { _synced: true })
    } catch {
      // 個別失敗はスキップ（次回起動時にリトライ）
    }
  }
}

// ---------------------------------------------------------------------------
// ローカルデータの一括移行
// ---------------------------------------------------------------------------

export async function migrateLocalData(
  userId: string,
  onProgress: (current: number, total: number) => void,
): Promise<void> {
  const properties = await db.properties.toArray()
  const templates = await db.axisTemplates.toArray()
  const total = properties.length + templates.length

  let current = 0

  for (const property of properties) {
    await pushProperty(property, userId)
    await db.properties.update(property.id, { _synced: true })
    current++
    onProgress(current, total)
  }

  for (const template of templates) {
    await pushAxisTemplate(template.type, template.axes, userId)
    current++
    onProgress(current, total)
  }
}
