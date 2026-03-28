import { v4 as uuidv4 } from 'uuid'
import type { EvaluationAxis, PropertyType } from '@/types'

type PresetAxis = { name: string; weight: number }

const LAND_PRESETS: PresetAxis[] = [
  { name: '最寄り駅・バス停へのアクセス', weight: 4 },
  { name: '周辺環境（スーパー・学校・病院）', weight: 3 },
  { name: '日当たり・採光', weight: 3 },
  { name: '土地の形状・広さ', weight: 3 },
  { name: '価格・坪単価', weight: 5 },
  { name: 'ハザードマップリスク', weight: 4 },
  { name: '騒音・振動・臭い', weight: 2 },
  { name: '地盤・地質', weight: 3 },
  { name: '前面道路の幅・接道条件', weight: 2 },
]

const BUILT_EXTRA_PRESETS: PresetAxis[] = [
  { name: '間取り・部屋数', weight: 4 },
  { name: '収納の充実度', weight: 3 },
  { name: '設備グレード（キッチン・風呂等）', weight: 3 },
  { name: '断熱・気密性能', weight: 3 },
  { name: '外観・デザイン', weight: 2 },
  { name: '駐車スペース', weight: 2 },
]

function buildAxes(presets: PresetAxis[]): EvaluationAxis[] {
  return presets.map((p, index) => ({
    id: uuidv4(),
    name: p.name,
    weight: p.weight,
    rating: null,
    comment: '',
    order: index,
  }))
}

export function getPresetAxes(type: PropertyType): EvaluationAxis[] {
  if (type === 'land') {
    return buildAxes(LAND_PRESETS)
  }
  return buildAxes([...LAND_PRESETS, ...BUILT_EXTRA_PRESETS])
}
