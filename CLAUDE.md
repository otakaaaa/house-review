# house-review CLAUDE.md

## プロジェクト概要

新居購入時の物件探しを支援する**個人用評価・管理アプリ**。
土地・建売物件を登録し、重み付き評価軸でスコアリング・比較するSPA。
データはブラウザのIndexedDBにローカル保存（サーバーなし）。
Vercelにホスティング済み。

---

## 技術スタック

| 項目 | 採用技術 | バージョン |
|---|---|---|
| フレームワーク | React 19 + Vite | react@19, vite@8 |
| 言語 | TypeScript | ~5.9 |
| スタイリング | Tailwind CSS v4 | @tailwindcss/vite |
| UIコンポーネント | shadcn/ui（@base-ui/react ベース） | @base-ui/react@1.3 |
| ローカルDB | Dexie.js（IndexedDB） | dexie@4 |
| 状態管理 | Zustand | zustand@5 |
| フォーム | React Hook Form + Zod | rhf@7, zod@4 |
| D&D | @dnd-kit/sortable | dnd-kit@6/10 |
| 画像圧縮 | browser-image-compression | v2 |
| ルーティング | React Router v7 | react-router-dom@7 |
| アイコン | lucide-react | v1 |
| トースト | sonner | v2 |

---

## ディレクトリ構造

```
src/
├── types/index.ts          # 全型定義・定数
├── lib/
│   ├── db.ts               # Dexieインスタンス・スキーマ
│   ├── scoring.ts          # 重み付きスコア計算
│   ├── presets.ts          # 評価軸プリセット（土地/建売）
│   └── image.ts            # 画像圧縮ユーティリティ
├── store/
│   └── uiStore.ts          # Zustand（フィルター・ソート・比較選択）
├── hooks/
│   ├── useProperty.ts      # 物件CRUD
│   ├── useProperties.ts    # 物件一覧（フィルター・ソート適用済み）
│   ├── useAxisTemplates.ts # 評価軸テンプレートCRUD
│   └── useCompare.ts       # 比較用データ取得
├── pages/
│   ├── PropertyListPage.tsx
│   ├── PropertyNewPage.tsx
│   ├── PropertyDetailPage.tsx
│   ├── PropertyEditPage.tsx
│   ├── EvaluationPage.tsx
│   └── ComparePage.tsx
└── components/
    ├── layout/             # Header, Layout
    ├── property/           # PropertyCard, PropertyForm, PhotoUploader, StatusBadge
    ├── evaluation/         # EvaluationForm, EvaluationAxisRow, RatingSelector, WeightSlider, ScoreDisplay
    └── compare/            # CompareTable
```

---

## データモデル（Dexie v2スキーマ）

```typescript
// テーブル: properties（主キー: id）
interface Property {
  id: string
  type: PropertyType          // 'land' | 'built'
  name: string
  address: string
  price: number | null        // 万円
  landArea: number | null     // m²
  buildingArea: number | null // m²（建売のみ）
  visitDate: string | null    // YYYY-MM-DD
  status: PropertyStatus      // 'considering' | 'visited' | 'rejected' | 'contracted'
  memo: string
  photos: Photo[]             // dataUrl形式、最大10枚
  evaluationAxes: EvaluationAxis[]
  totalScore: number | null   // 0-100、保存時に自動計算
  createdAt: string
  updatedAt: string
}

// テーブル: axisTemplates（主キー: type）
interface AxisTemplateRecord {
  type: PropertyType
  axes: AxisTemplate[]        // 評価軸定義（評価・コメントなし）
}
```

---

## 主要な設計判断

### @base-ui/react の制約
shadcn/uiが内部で`@base-ui/react`を使用しており、Radix UIとはAPIが異なる。
- `<Button asChild>` は**使えない** → `<Link className={buttonVariants({...})}>` を使う
- `<SelectValue>` はvalueのkeyをそのまま表示する → ラベルを子要素として渡す: `<SelectValue>{label}</SelectValue>`

### React Hook Form + ZodのrawSchemaパターン
`.transform()`を使うとzodResolverの型が合わなくなる。
**必ず** rawSchema（全フィールドをstring型）で定義し、`toFormValues()`で手動変換する。

```typescript
// NG: transform使用
const schema = z.object({ price: z.string().transform(Number) })

// OK: rawSchema + 手動変換
const rawSchema = z.object({ price: z.string() })
type RawFormValues = z.infer<typeof rawSchema>
function toFormValues(raw: RawFormValues): FormValues {
  return { price: raw.price === '' ? null : Number(raw.price) }
}
```

### useCallbackによる関数参照の安定化
`useProperty`・`useAxisTemplates`の全関数は必ず`useCallback(fn, [])`でラップする。
`useEffect`の依存配列に入れたとき無限ループになるのを防ぐため。

### 評価軸テンプレートの設計
- **軸の定義**（名前・重み・順序）は種別ごとに共有: `axisTemplates` テーブル
- **評価・コメント**は物件ごとに保持: `properties.evaluationAxes`
- 保存時は `saveTemplate` と `updateProperty` を `Promise.all` で同時実行

### Dexieスキーマのバージョン管理
スキーマ変更時は必ず`version(N)`を追加し、旧バージョンも残す。
現在: version 1（properties） → version 2（+ axisTemplates）

### スコア計算
`calcTotalScore(axes)` は評価済み軸のみを使って加重平均を計算。
評価未入力の軸はスコアに影響しない。

---

## コード規約

- TypeScriptの`any`・`unknown`は使用禁止
- `class`はError継承など必要な場合のみ使用可
- ミューテーションは禁止、スプレッド演算子で新オブジェクトを返す
- コンポーネントのpropsは`interface`で定義
- `console.log`は本番コードに残さない
- ファイルサイズの目安: 800行以内
- ハードコードは禁止（定数は上部またはtypes/index.tsに定義）

---

## ルーティング

| パス | ページ |
|---|---|
| `/` | 物件一覧 |
| `/properties/new` | 物件登録 |
| `/properties/:id` | 物件詳細 |
| `/properties/:id/edit` | 物件編集 |
| `/properties/:id/evaluation` | 評価入力 |
| `/compare` | 物件比較 |

SPAのため`vercel.json`で全パスを`index.html`にリライト設定済み。

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # tsc + vite build
npm run lint     # ESLint
```
