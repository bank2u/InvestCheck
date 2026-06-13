# Results Screen Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder ResultsScreen sections, replace fund list with per-asset explanation cards, update allocation percentages to match SEC regulatory table, and remove unused fundRecommendations data.

**Architecture:** Pure data and JSX changes — no new components needed. A new `assetDescriptions.ts` utility provides static Thai descriptions per asset class. ResultsScreen.tsx is reordered and renders asset cards inline using existing allocation data plus the new descriptions lookup.

**Tech Stack:** React 18, TypeScript, plain CSS, Vite

---

### Task 1: Update allocation percentages in allocations.ts

**Files:**
- Modify: `src/utils/allocations.ts`

**Context:**
Current percentages don't match the SEC regulatory table. New values (all rows sum to 100%):

| Level | debt | equity | cash | alternative |
|-------|------|--------|------|-------------|
| 1 | 90% | 5% | 0% | 5% |
| 2 | 70% | 20% | 0% | 10% |
| 3 | 60% | 30% | 0% | 10% |
| 4 | 40% | 40% | 0% | 20% |
| 5 | 15% | 60% | 0% | 25% |

- [ ] **Step 1: Replace `src/utils/allocations.ts` with updated percentages**

```typescript
import { RiskLevel, AllocationSet } from '../types';

export const ALLOCATIONS: Record<RiskLevel, AllocationSet> = {
  1: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 90, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 5, color: '#f59e0b' },
    cash: { name: 'เงินสด', percentage: 0, color: '#3b82f6' },
    alternative: { name: 'ทางเลือก', percentage: 5, color: '#8b5cf6' },
  },
  2: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 70, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 20, color: '#f59e0b' },
    cash: { name: 'เงินสด', percentage: 0, color: '#3b82f6' },
    alternative: { name: 'ทางเลือก', percentage: 10, color: '#8b5cf6' },
  },
  3: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 60, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 30, color: '#f59e0b' },
    cash: { name: 'เงินสด', percentage: 0, color: '#3b82f6' },
    alternative: { name: 'ทางเลือก', percentage: 10, color: '#8b5cf6' },
  },
  4: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 40, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 40, color: '#f59e0b' },
    cash: { name: 'เงินสด', percentage: 0, color: '#3b82f6' },
    alternative: { name: 'ทางเลือก', percentage: 20, color: '#8b5cf6' },
  },
  5: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 15, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 60, color: '#f59e0b' },
    cash: { name: 'เงินสด', percentage: 0, color: '#3b82f6' },
    alternative: { name: 'ทางเลือก', percentage: 25, color: '#8b5cf6' },
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Volumes/mydata/playground/pre-invest-test
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/allocations.ts
git commit -m "fix: update allocation percentages to match SEC regulatory table"
```

---

### Task 2: Create asset descriptions utility

**Files:**
- Create: `src/utils/assetDescriptions.ts`

**Context:**
Static lookup keyed by the exact asset `name` string used in `allocations.ts`. Used by ResultsScreen to render "คือ ..." and "ได้แก่ ..." for each non-zero asset card.

- [ ] **Step 1: Create `src/utils/assetDescriptions.ts`**

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
    examples: 'ทองคำ, กองทุนอสังหาริมทรัพย์ (REITs), กองทุนน้ำมัน',
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/assetDescriptions.ts
git commit -m "feat: add asset descriptions utility for results screen"
```

---

### Task 3: Remove fundRecommendations from types and data

**Files:**
- Modify: `src/types.ts`
- Modify: `src/utils/recommendations.ts`

**Context:**
`fundRecommendations: string[]` is being replaced by the new asset cards. It must be removed from the `RiskProfile` interface in `types.ts` and from all 5 risk level entries in `recommendations.ts`.

Current `RiskProfile` in `src/types.ts` (lines 26–34):
```typescript
export interface RiskProfile {
  level: RiskLevel;
  thaiName: string;
  scoreRange: string;
  allocations: AllocationSet;
  recommendation: string;
  fundRecommendations: string[];  // ← remove this line
  color: string;
}
```

- [ ] **Step 1: Remove `fundRecommendations` from `src/types.ts`**

Replace the `RiskProfile` interface with:

```typescript
export interface RiskProfile {
  level: RiskLevel;
  thaiName: string;
  scoreRange: string;
  allocations: AllocationSet;
  recommendation: string;
  color: string;
}
```

- [ ] **Step 2: Remove `fundRecommendations` arrays from `src/utils/recommendations.ts`**

Replace the entire file content with:

```typescript
import { RiskLevel, RiskProfile } from '../types';
import { ALLOCATIONS } from './allocations';
import { getScoreRange } from './scoring';

export const RISK_PROFILES: Record<RiskLevel, RiskProfile> = {
  1: {
    level: 1,
    thaiName: 'เสี่ยงต่ำ',
    scoreRange: getScoreRange(1),
    allocations: ALLOCATIONS[1],
    recommendation: 'คุณชอบปลอดภัย เหมาะเก็บเงินไว้ใช้เร็ว ๆ หรือไม่อยากเสียเงินเลย ลงทุนตามนี้จะนอนหลับสบาย',
    color: '#EF4444',
  },
  2: {
    level: 2,
    thaiName: 'เสี่ยงปานกลางค่อนข้างต่ำ',
    scoreRange: getScoreRange(2),
    allocations: ALLOCATIONS[2],
    recommendation: 'คุณระมัดระวัง แต่อยากให้เงินเพิ่มขึ้นด้วย เหมาะสำหรับผู้ที่อยากได้ดอกผลแต่ไม่อยากเสี่ยง ปล่อยเงิน 3-5 ปี',
    color: '#F97316',
  },
  3: {
    level: 3,
    thaiName: 'เสี่ยงปานกลางค่อนข้างสูง',
    scoreRange: getScoreRange(3),
    allocations: ALLOCATIONS[3],
    recommendation: 'คุณยอมรับความเสี่ยงเพื่อเงินเพิ่มขึ้นมากขึ้น ปล่อยเงิน 3-5 ปี จะเห็นผลดีต่อเมื่อตลาดขึ้น',
    color: '#FBBF24',
  },
  4: {
    level: 4,
    thaiName: 'เสี่ยงสูง',
    scoreRange: getScoreRange(4),
    allocations: ALLOCATIONS[4],
    recommendation: 'คุณกล้าเสี่ยง อยากให้เงินเพิ่มเร็ว ต้องรับว่าหุ้นขึ้นลงได้ ปล่อยเงิน 5+ ปี จึงจะดีที่สุด',
    color: '#3B82F6',
  },
  5: {
    level: 5,
    thaiName: 'เสี่ยงสูงมาก',
    scoreRange: getScoreRange(5),
    allocations: ALLOCATIONS[5],
    recommendation: 'คุณพร้อมสำหรับการลงทุนจริง ๆ อยากได้กำไรสูง ต้องทนเห็นเงินลดลง แล้วขึ้นมา ต้องมองไกล 7-10 ปี',
    color: '#1E40AF',
  },
};

export function getRiskProfile(level: RiskLevel): RiskProfile {
  return RISK_PROFILES[level];
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/utils/recommendations.ts
git commit -m "refactor: remove fundRecommendations from RiskProfile"
```

---

### Task 4: Reorder sections and add asset cards in ResultsScreen

**Files:**
- Modify: `src/components/ResultsScreen.tsx`
- Modify: `src/components/ResultsScreen.css`

**Context:**

Current section order in `ResultsScreen.tsx`:
1. risk-card
2. allocations-section (donut)
3. recommendation-section
4. fund-recommendations-section ← to be replaced

New order:
1. risk-card
2. recommendation-section ← moved up
3. allocations-section (donut) ← moved down
4. asset-cards-section ← new, replaces fund-recommendations-section

The `allocations` array is already built at the top of the component. The asset cards section renders non-zero allocations sorted descending, with a lookup into `ASSET_DESCRIPTIONS`.

Current CSS rules to remove from `ResultsScreen.css` (lines 131–167):
```css
.fund-recommendations-section { ... }
.funds-list { ... }
.fund-item { ... }
.fund-item:hover { ... }
```

- [ ] **Step 1: Update imports in `src/components/ResultsScreen.tsx`**

Add the asset descriptions import after the existing imports:

```tsx
import { ASSET_DESCRIPTIONS } from '../utils/assetDescriptions';
```

The full import block at the top of the file becomes:
```tsx
import { useState } from 'react';
import { RiskProfile, AnswerValue, Answers } from '../types';
import ProjectionScreen from './ProjectionScreen';
import AllocationChart from './AllocationChart';
import { ASSET_DESCRIPTIONS } from '../utils/assetDescriptions';
import './ResultsScreen.css';
```

- [ ] **Step 2: Replace the full JSX return in `src/components/ResultsScreen.tsx`**

Replace everything from `return (` to the closing `);` with:

```tsx
  const nonZeroAllocations = allocations
    .filter((a) => a.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="results-screen">
      <div className="risk-card" style={{ borderLeftColor: profile.color }}>
        <div className="risk-level" style={{ color: profile.color }}>
          {profile.thaiName}
        </div>
        <div className="risk-score">
          คะแนน: {score} ({profile.scoreRange})
        </div>
      </div>

      <div className="recommendation-section">
        <h2 className="section-title">คำแนะนำ</h2>
        <p className="recommendation-text">{profile.recommendation}</p>
      </div>

      <div className="allocations-section">
        <h2 className="section-title">การจัดสรรเงินลงทุน</h2>
        <AllocationChart allocations={allocations} />
      </div>

      <div className="asset-cards-section">
        <h2 className="section-title">สินทรัพย์ที่เหมาะสม</h2>
        {nonZeroAllocations.map((asset) => {
          const desc = ASSET_DESCRIPTIONS[asset.name];
          return (
            <div
              key={asset.name}
              className="asset-card"
              style={{ borderLeftColor: asset.color }}
            >
              <div className="asset-card-header">
                <span className="asset-card-name">{asset.name}</span>
                <span className="asset-card-pct" style={{ color: asset.color }}>
                  {asset.percentage}%
                </span>
              </div>
              {desc && (
                <>
                  <div className="asset-card-row">
                    <span className="asset-card-label">คือ: </span>
                    {desc.description}
                  </div>
                  <div className="asset-card-row">
                    <span className="asset-card-label">ได้แก่: </span>
                    {desc.examples}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="projection-button" onClick={() => setShowProjection(true)}>
        💡 ดูการลงทุนของคุณใน {Math.min(10, 90 - userAge)} ปี
      </button>

      <button className="restart-button" onClick={onRestart}>
        ทำแบบทดสอบใหม่
      </button>

      {showProjection && (
        <ProjectionScreen
          riskLevel={profile.level}
          userAge={userAge}
          onBack={() => setShowProjection(false)}
        />
      )}
    </div>
  );
```

- [ ] **Step 3: Remove old fund CSS and add asset card CSS in `src/components/ResultsScreen.css`**

Remove these four rule blocks from `ResultsScreen.css`:
```css
.fund-recommendations-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: var(--spacing-20) 0;
}

.funds-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.fund-item {
  padding: var(--spacing-12) var(--spacing-16);
  background-color: white;
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text);
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.06);
  transition: all var(--duration-base) var(--easing);
}

.fund-item:hover {
  background-color: rgba(0, 102, 204, 0.03);
  transform: translateX(4px);
}
```

Then add these new rules before the `@media (max-width: 480px)` block:

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

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: `✓ built in ...ms` with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultsScreen.tsx src/components/ResultsScreen.css
git commit -m "feat: reorder results sections and add asset description cards"
```
