# Results Screen Revamp Design Spec

## Goal

Reorder the ResultsScreen sections for better reading flow, and replace the "กองทุนที่เหมาะสม" fund list with a new "สินทรัพย์ที่เหมาะสม" section that explains each asset class with plain-language Thai descriptions and examples.

---

## Scope

- Reorder JSX sections in `ResultsScreen.tsx`
- Add `src/utils/assetDescriptions.ts` — static lookup for asset class descriptions
- Remove `fundRecommendations` from `RiskProfile` type and all data files
- Update `ResultsScreen.tsx` to render new asset cards section
- Update `ResultsScreen.css` — remove fund list styles, add asset card styles

---

## New Section Order

```
1. Risk card          (risk level name + score) — unchanged
2. คำแนะนำ            (recommendation text) — moved UP from position 3
3. การจัดสรรเงินลงทุน  (donut chart) — moved DOWN from position 2
4. สินทรัพย์ที่เหมาะสม (new asset cards) — replaces กองทุนที่เหมาะสม
5. Projection button
6. Restart button
```

---

## Asset Descriptions Data

**New file:** `src/utils/assetDescriptions.ts`

Static lookup keyed by the exact asset `name` string from `allocations.ts`. Covers only the 3 asset classes that ever have non-zero percentages (เงินสด is always 0% and never appears).

```typescript
export interface AssetDescription {
  description: string;
  examples: string;
}

export const ASSET_DESCRIPTIONS: Record<string, AssetDescription> = {
  'เงินฝาก & พันธบัตร': {
    description: 'ฝากเงินหรือให้รัฐ/บริษัทกู้ รับดอกเบี้ยสม่ำเสมอ ความเสี่ยงต่ำ',
    examples: 'เงินฝากประจำ, กองทุนตลาดเงิน, พันธบัตรรัฐบาล, หุ้นกู้เอกชน',
  },
  'หุ้น': {
    description: 'ซื้อความเป็นเจ้าของบริษัท โอกาสผลตอบแทนสูงกว่าเงินฝาก แต่ราคาขึ้นลงได้',
    examples: 'กองทุนหุ้นไทย, กองทุนหุ้นต่างประเทศ, ETF',
  },
  'ทางเลือก': {
    description: 'สินทรัพย์นอกเหนือหุ้นและพันธบัตร ช่วยกระจายความเสี่ยงในพอร์ต',
    examples: 'ทองคำ, กองทุนอสังหาริมทรัพย์ (REITs), สินค้าโภคภัณฑ์',
  },
};
```

---

## สินทรัพย์ที่เหมาะสม Section

Rendered in `ResultsScreen.tsx`. Shows one card per non-zero allocation, in descending percentage order (same sort as donut legend).

**Each card:**
```
┌──────────────────────────────────────┐
│ [colored left border]                │
│ [asset name]              [X%]       │
│ คือ: [description]                   │
│ ได้แก่: [examples]                   │
└──────────────────────────────────────┘
```

- Left border color = `allocation.color` (same colors as donut)
- Asset name: `font-weight: bold`, `font-size: base`
- Percentage: `font-weight: bold`, right-aligned, color matches border
- "คือ:" label: `font-weight: semibold`, color: text-secondary
- Description text: normal weight, color: text
- "ได้แก่:" label: `font-weight: semibold`, color: text-secondary
- Examples text: normal weight, color: text
- If `ASSET_DESCRIPTIONS[allocation.name]` has no entry, skip the คือ/ได้แก่ lines silently

**Rendering logic:**
```typescript
const nonZeroAllocations = allocations
  .filter((a) => a.percentage > 0)
  .sort((a, b) => b.percentage - a.percentage);
```

---

## Remove fundRecommendations

`fundRecommendations` is no longer used. Remove it from:

1. `src/types.ts` — remove `fundRecommendations: string[]` from `RiskProfile` interface
2. `src/utils/recommendations.ts` — remove `fundRecommendations` array from all 5 risk level entries
3. `src/components/ResultsScreen.tsx` — remove the `fund-recommendations-section` div and its contents
4. `src/components/ResultsScreen.css` — remove `.fund-recommendations-section`, `.funds-list`, `.fund-item` rules

---

## CSS Changes

**Remove from `ResultsScreen.css`:**
- `.fund-recommendations-section`
- `.funds-list`
- `.fund-item`
- `.fund-item:hover`

**Add to `ResultsScreen.css`:**

```css
.asset-cards-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: var(--spacing-20) 0;
}

.asset-card {
  padding: var(--spacing-16) var(--spacing-20);
  border-left: 4px solid;
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.asset-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-card-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.asset-card-pct {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.asset-card-row {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: var(--line-height-relaxed);
}

.asset-card-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

@media (max-width: 480px) {
  .asset-card {
    padding: var(--spacing-12) var(--spacing-16);
  }
}
```

---

## Files Changed

| File | Action |
|------|--------|
| `src/utils/assetDescriptions.ts` | Create |
| `src/types.ts` | Modify — remove `fundRecommendations` from `RiskProfile` |
| `src/utils/recommendations.ts` | Modify — remove `fundRecommendations` from all 5 entries |
| `src/components/ResultsScreen.tsx` | Modify — reorder sections, add asset cards, remove fund list |
| `src/components/ResultsScreen.css` | Modify — remove fund styles, add asset card styles |
