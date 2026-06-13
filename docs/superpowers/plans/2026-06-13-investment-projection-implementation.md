# Investment Projection Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive investment projection calculator that shows users how their monthly savings will grow over time when invested at their risk level, compared to a bank deposit.

**Architecture:** 
- New screen (ProjectionScreen) accessible from ResultsScreen via "See projection" button
- Modular components: Input (monthly amount + year slider) → Calculator (projections) → Chart (visualization) + Summary (final numbers)
- All calculations client-side using hooks and utility functions
- Responsive design (mobile-first) with plain CSS

**Tech Stack:** React 18, TypeScript, plain CSS (matching existing project), SVG-based chart

---

## File Structure

**New Files:**
```
src/
  components/
    ProjectionScreen.tsx          # Parent screen container
    ProjectionInput.tsx           # Input field + year slider
    ProjectionChart.tsx           # Two-line chart visualization
    ProjectionSummary.tsx         # Summary card (final balances)
    ProjectionScreen.css          # Screen layout styles
    ProjectionInput.css           # Input styling
    ProjectionChart.css           # Chart styling
    ProjectionSummary.css         # Summary card styling
  hooks/
    useProjectionCalculator.ts    # Custom hook for calculations
  utils/
    projectionCalculations.ts     # Core calculation functions
    getReturnRateByLevel.ts       # Return rates by risk level
    getMaxProjectionYears.ts      # Age-based max year calculation
```

**Modified Files:**
```
src/App.tsx                       # Add ProjectionScreen route
src/components/ResultsScreen.tsx  # Add "See projection" button
```

---

## Tasks

### Task 1: Create Return Rate Utility

**Files:**
- Create: `src/utils/getReturnRateByLevel.ts`

- [ ] **Step 1: Write utility function**

Create the file with the return rate mapping:

```typescript
import { RiskLevel } from '../types';

export function getReturnRateByLevel(riskLevel: RiskLevel): number {
  const rates: Record<RiskLevel, number> = {
    1: 0.025,  // 2.5%
    2: 0.045,  // 4.5%
    3: 0.065,  // 6.5%
    4: 0.085,  // 8.5%
    5: 0.10,   // 10%
  };
  return rates[riskLevel];
}
```

- [ ] **Step 2: Test the function**

Run in browser console or write quick test. Verify:
- `getReturnRateByLevel(1)` returns `0.025`
- `getReturnRateByLevel(5)` returns `0.10`

- [ ] **Step 3: Commit**

```bash
git add src/utils/getReturnRateByLevel.ts
git commit -m "feat: add return rate lookup by risk level"
```

---

### Task 2: Create Max Projection Years Utility

**Files:**
- Create: `src/utils/getMaxProjectionYears.ts`

- [ ] **Step 1: Write utility function**

```typescript
export function getMaxProjectionYears(userAge: number): number {
  const maxAge = 90;
  const minYears = 5;
  const maxYears = maxAge - userAge;
  return Math.max(minYears, maxYears);
}
```

- [ ] **Step 2: Test edge cases**

Verify:
- Age 25: returns 65 (90 - 25)
- Age 85: returns 5 (min threshold)
- Age 88: returns 5 (min threshold)

- [ ] **Step 3: Commit**

```bash
git add src/utils/getMaxProjectionYears.ts
git commit -m "feat: add age-based max projection years calculation"
```

---

### Task 3: Create Projection Calculations

**Files:**
- Create: `src/utils/projectionCalculations.ts`

- [ ] **Step 1: Write calculation functions**

```typescript
export interface YearlyProjection {
  year: number;
  investmentBalance: number;
  bankBalance: number;
}

export function calculateProjections(
  monthlyAmount: number,
  years: number,
  annualInvestmentReturn: number
): YearlyProjection[] {
  const bankReturnRate = 0.014; // 1.4%
  const results: YearlyProjection[] = [];

  let investmentBalance = 0;
  let bankBalance = 0;

  for (let year = 0; year <= years; year++) {
    results.push({
      year,
      investmentBalance: Math.round(investmentBalance),
      bankBalance: Math.round(bankBalance),
    });

    // Add monthly deposits (12 months) and apply returns
    const yearlyDeposit = monthlyAmount * 12;
    investmentBalance = investmentBalance * (1 + annualInvestmentReturn) + yearlyDeposit;
    bankBalance = bankBalance * (1 + bankReturnRate) + yearlyDeposit;
  }

  return results;
}

export function getFinalProjection(projections: YearlyProjection[], year: number) {
  return projections.find((p) => p.year === year) || projections[projections.length - 1];
}
```

- [ ] **Step 2: Test calculations manually**

Verify for monthly ฿5,000, 10 years, 6.5% return:
- Year 0: both should be ≈฿0
- Year 1: investment ≈฿61,825, bank ≈฿60,840
- Year 10: investment ≈฿700,000, bank ≈฿632,000

- [ ] **Step 3: Commit**

```bash
git add src/utils/projectionCalculations.ts
git commit -m "feat: add investment projection calculation logic"
```

---

### Task 4: Create useProjectionCalculator Hook

**Files:**
- Create: `src/hooks/useProjectionCalculator.ts`

- [ ] **Step 1: Write custom hook**

```typescript
import { useMemo } from 'react';
import { RiskLevel } from '../types';
import { calculateProjections, YearlyProjection } from '../utils/projectionCalculations';
import { getReturnRateByLevel } from '../utils/getReturnRateByLevel';

export function useProjectionCalculator(
  monthlyAmount: number,
  years: number,
  riskLevel: RiskLevel
): YearlyProjection[] {
  const returnRate = getReturnRateByLevel(riskLevel);

  const projections = useMemo(() => {
    if (monthlyAmount <= 0 || years < 5) {
      return [];
    }
    return calculateProjections(monthlyAmount, years, returnRate);
  }, [monthlyAmount, years, returnRate]);

  return projections;
}
```

- [ ] **Step 2: Test hook behavior**

Verify:
- Hook returns empty array if monthlyAmount is 0
- Hook returns projections for valid inputs
- Hook recalculates when any param changes

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProjectionCalculator.ts
git commit -m "feat: add useProjectionCalculator hook"
```

---

### Task 5: Create ProjectionInput Component

**Files:**
- Create: `src/components/ProjectionInput.tsx`
- Create: `src/components/ProjectionInput.css`

- [ ] **Step 1: Write component**

```typescript
import { RiskLevel } from '../types';
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import './ProjectionInput.css';

interface Props {
  monthlyAmount: number;
  selectedYear: number;
  userAge: number;
  riskLevel: RiskLevel;
  onAmountChange: (amount: number) => void;
  onYearChange: (year: number) => void;
}

export default function ProjectionInput({
  monthlyAmount,
  selectedYear,
  userAge,
  onAmountChange,
  onYearChange,
}: Props) {
  const maxYear = getMaxProjectionYears(userAge);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const amount = value ? parseInt(value, 10) : 0;
    onAmountChange(amount);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    onYearChange(year);
  };

  return (
    <div className="projection-input">
      <div className="input-group">
        <label className="input-label">จำนวนเงินออมต่อเดือน</label>
        <div className="currency-input-wrapper">
          <span className="currency-symbol">฿</span>
          <input
            type="text"
            inputMode="numeric"
            className="currency-input"
            placeholder="ใส่จำนวนเงิน"
            value={monthlyAmount.toLocaleString()}
            onChange={handleAmountInput}
          />
        </div>
        {monthlyAmount === 0 && <div className="input-error">กรุณาใส่จำนวนเงิน</div>}
      </div>

      <div className="slider-group">
        <label className="slider-label">
          ระยะเวลาการลงทุน: <span className="slider-value">{selectedYear} ปี</span>
        </label>
        <input
          type="range"
          min={5}
          max={maxYear}
          value={selectedYear}
          onChange={handleYearChange}
          className="year-slider"
        />
        <div className="slider-marks">
          <span>5</span>
          <span>{Math.floor(maxYear / 2)}</span>
          <span>{maxYear}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write component CSS**

```css
.projection-input {
  padding: var(--spacing-16);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-24);
  border-bottom: 2px solid var(--color-border);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.input-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.currency-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.currency-symbol {
  padding: 0 var(--spacing-12);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.currency-input {
  flex: 1;
  padding: var(--spacing-12) var(--spacing-12);
  border: none;
  font-size: var(--font-size-base);
  font-family: inherit;
  outline: none;
  min-height: 44px;
}

.currency-input:focus {
  background-color: rgba(0, 102, 204, 0.03);
}

.input-error {
  font-size: var(--font-size-sm);
  color: #ef4444;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.slider-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.slider-value {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.year-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.year-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all var(--duration-base) var(--easing);
}

.year-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 8px rgba(0, 102, 204, 0.4);
}

.year-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  transition: all var(--duration-base) var(--easing);
}

.year-slider::-moz-range-thumb:hover {
  box-shadow: 0 0 8px rgba(0, 102, 204, 0.4);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: 0 4px;
}

@media (max-width: 480px) {
  .projection-input {
    padding: var(--spacing-12);
    gap: var(--spacing-16);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectionInput.tsx src/components/ProjectionInput.css
git commit -m "feat: add ProjectionInput component with currency and slider"
```

---

### Task 6: Create ProjectionSummary Component

**Files:**
- Create: `src/components/ProjectionSummary.tsx`
- Create: `src/components/ProjectionSummary.css`

- [ ] **Step 1: Write component**

```typescript
import { RiskLevel } from '../types';
import './ProjectionSummary.css';

interface Props {
  investmentBalance: number;
  bankBalance: number;
  years: number;
  riskLevel: RiskLevel;
}

const riskColors: Record<RiskLevel, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#FBBF24',
  4: '#3B82F6',
  5: '#1E40AF',
};

export default function ProjectionSummary({
  investmentBalance,
  bankBalance,
  years,
  riskLevel,
}: Props) {
  const difference = investmentBalance - bankBalance;
  const percentageGain = bankBalance > 0 ? ((difference / bankBalance) * 100).toFixed(1) : '0';

  return (
    <div
      className="projection-summary"
      style={{ borderLeftColor: riskColors[riskLevel] }}
    >
      <div className="summary-header">หลังจาก {years} ปี</div>

      <div className="summary-row">
        <span className="summary-label">ลงทุนตามความเสี่ยง:</span>
        <span className="summary-value">฿{investmentBalance.toLocaleString('th-TH')}</span>
      </div>

      <div className="summary-row">
        <span className="summary-label">เงินฝากธนาคาร:</span>
        <span className="summary-value">฿{bankBalance.toLocaleString('th-TH')}</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-row highlight">
        <span className="summary-label">💰 เงินเพิ่มเติม:</span>
        <span className="summary-value gain">
          ฿{difference.toLocaleString('th-TH')} (+{percentageGain}%)
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write component CSS**

```css
.projection-summary {
  padding: var(--spacing-20);
  border-left: 4px solid;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.summary-header {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.summary-label {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.summary-value {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
  text-align: right;
}

.summary-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--spacing-4) 0;
}

.summary-row.highlight {
  padding-top: var(--spacing-8);
}

.summary-row.highlight .summary-label {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.summary-value.gain {
  color: var(--color-gain);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 480px) {
  .projection-summary {
    padding: var(--spacing-16);
  }

  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectionSummary.tsx src/components/ProjectionSummary.css
git commit -m "feat: add ProjectionSummary card component"
```

---

### Task 7: Create ProjectionChart Component

**Files:**
- Create: `src/components/ProjectionChart.tsx`
- Create: `src/components/ProjectionChart.css`

- [ ] **Step 1: Write chart component using SVG**

```typescript
import { useMemo } from 'react';
import { YearlyProjection } from '../utils/projectionCalculations';
import './ProjectionChart.css';

interface Props {
  projections: YearlyProjection[];
  years: number;
}

export default function ProjectionChart({ projections, years }: Props) {
  if (!projections || projections.length === 0) {
    return <div className="chart-empty">กรุณาใส่จำนวนเงินเพื่อดูการคาดการณ์</div>;
  }

  const chartDimensions = useMemo(() => {
    const maxBalance = Math.max(
      ...projections.map((p) => Math.max(p.investmentBalance, p.bankBalance))
    );

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 100; // percentage
    const height = 300;

    const xScale = (year: number) => {
      const xRange = width - padding.left - padding.right;
      return padding.left + (year / years) * xRange;
    };

    const yScale = (balance: number) => {
      const yRange = height - padding.top - padding.bottom;
      return height - padding.bottom - (balance / maxBalance) * yRange;
    };

    return { xScale, yScale, maxBalance, padding };
  }, [projections, years]);

  const { xScale, yScale, maxBalance, padding } = chartDimensions;

  const investmentPath = projections
    .map((p) => `${xScale(p.year)},${yScale(p.investmentBalance)}`)
    .join(' L ');

  const bankPath = projections
    .map((p) => `${xScale(p.year)},${yScale(p.bankBalance)}`)
    .join(' L ');

  const yAxisMax = Math.ceil(maxBalance / 100000) * 100000;

  return (
    <div className="projection-chart">
      <svg viewBox={`0 0 ${padding.left + 100 - padding.right} 300`} className="chart-svg">
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = yAxisMax * ratio;
          const y = yScale((value / yAxisMax) * maxBalance);
          return (
            <g key={`y-label-${i}`}>
              <line x1={padding.left - 4} y1={y} x2={padding.left} y2={y} stroke="#ddd" />
              <text x={padding.left - 8} y={y} textAnchor="end" fontSize="11" fill="#6b7280">
                {Math.round(value / 1000)}K
              </text>
            </g>
          );
        })}

        {/* Y-axis line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={300 - padding.bottom}
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <line
          x1={padding.left}
          y1={300 - padding.bottom}
          x2={100 - padding.right}
          y2={300 - padding.bottom}
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = yScale((ratio / 1) * maxBalance);
          return (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={100 - padding.right}
              y2={y}
              stroke="#f5f5f5"
              strokeWidth="1"
            />
          );
        })}

        {/* Investment line */}
        <polyline
          points={investmentPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bank deposit line */}
        <polyline
          points={bankPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels (every 2 years) */}
        {projections
          .filter((p) => p.year % 2 === 0)
          .map((p) => (
            <text
              key={`x-label-${p.year}`}
              x={xScale(p.year)}
              y={300 - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {p.year}ปี
            </text>
          ))}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }} />
          <span className="legend-label">ลงทุนตามความเสี่ยง</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#9ca3af' }} />
          <span className="legend-label">เงินฝากธนาคาร 1.4%</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write component CSS**

```css
.projection-chart {
  padding: var(--spacing-16) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.chart-empty {
  padding: var(--spacing-24);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.chart-svg {
  width: 100%;
  height: auto;
  max-height: 300px;
  background-color: transparent;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-24);
  font-size: var(--font-size-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  color: var(--color-text-secondary);
}

@media (max-width: 480px) {
  .chart-legend {
    flex-direction: column;
    gap: var(--spacing-12);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectionChart.tsx src/components/ProjectionChart.css
git commit -m "feat: add ProjectionChart SVG component"
```

---

### Task 8: Create ProjectionScreen Parent Component

**Files:**
- Create: `src/components/ProjectionScreen.tsx`
- Create: `src/components/ProjectionScreen.css`

- [ ] **Step 1: Write component**

```typescript
import { useState } from 'react';
import { RiskLevel } from '../types';
import { useProjectionCalculator } from '../hooks/useProjectionCalculator';
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import { getFinalProjection } from '../utils/projectionCalculations';
import ProjectionInput from './ProjectionInput';
import ProjectionChart from './ProjectionChart';
import ProjectionSummary from './ProjectionSummary';
import './ProjectionScreen.css';

interface Props {
  riskLevel: RiskLevel;
  userAge: number;
  onBack: () => void;
}

export default function ProjectionScreen({ riskLevel, userAge, onBack }: Props) {
  const maxYear = getMaxProjectionYears(userAge);
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [selectedYear, setSelectedYear] = useState(10);

  const projections = useProjectionCalculator(monthlyAmount, selectedYear, riskLevel);
  const finalProjection = getFinalProjection(projections, selectedYear);

  return (
    <div className="projection-screen">
      <div className="projection-header">
        <button className="back-button" onClick={onBack}>
          ← กลับไปผลลัพธ์
        </button>
        <h2 className="projection-title">💡 ดูการลงทุนของคุณ</h2>
      </div>

      <ProjectionInput
        monthlyAmount={monthlyAmount}
        selectedYear={selectedYear}
        userAge={userAge}
        riskLevel={riskLevel}
        onAmountChange={setMonthlyAmount}
        onYearChange={setSelectedYear}
      />

      <div className="chart-section">
        {monthlyAmount > 0 && (
          <>
            <ProjectionSummary
              investmentBalance={finalProjection?.investmentBalance || 0}
              bankBalance={finalProjection?.bankBalance || 0}
              years={selectedYear}
              riskLevel={riskLevel}
            />
            <ProjectionChart projections={projections} years={selectedYear} />
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write component CSS**

```css
.projection-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg);
  padding-bottom: var(--spacing-24);
}

.projection-header {
  padding: var(--spacing-16);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.back-button {
  padding: var(--spacing-8) var(--spacing-12);
  background-color: transparent;
  color: var(--color-primary);
  border: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: all var(--duration-base) var(--easing);
}

.back-button:hover {
  background-color: rgba(0, 102, 204, 0.05);
}

.back-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.projection-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text);
  flex: 1;
}

.chart-section {
  flex: 1;
  padding: var(--spacing-16);
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 480px) {
  .projection-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .projection-title {
    font-size: var(--font-size-base);
  }

  .chart-section {
    padding: var(--spacing-12);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectionScreen.tsx src/components/ProjectionScreen.css
git commit -m "feat: add ProjectionScreen parent component"
```

---

### Task 9: Update ResultsScreen to Add "See Projection" Button

**Files:**
- Modify: `src/components/ResultsScreen.tsx`

- [ ] **Step 1: Update imports**

Add state and button. Find the RestartButton section and add above it:

```typescript
const [showProjection, setShowProjection] = useState(false);
```

- [ ] **Step 2: Add button before restart button**

In the JSX, before `<button className="restart-button"`, add:

```typescript
      <button className="projection-button" onClick={() => setShowProjection(true)}>
        💡 ดูการลงทุนของคุณใน {Math.min(10, 90 - (userAge || 25))} ปี
      </button>
```

Note: `userAge` needs to come from the answers. We'll need to calculate it from Q1.

- [ ] **Step 3: Add projection rendering**

After the closing `</div>` of recommendation-section, add:

```typescript
      {showProjection && (
        <ProjectionScreen
          riskLevel={profile.level}
          userAge={userAge}
          onBack={() => setShowProjection(false)}
        />
      )}
```

But first, import ProjectionScreen at the top:
```typescript
import ProjectionScreen from './ProjectionScreen';
```

- [ ] **Step 4: Add CSS for button**

Add to `ResultsScreen.css`:

```css
.projection-button {
  padding: var(--spacing-16) var(--spacing-24);
  min-height: 44px;
  background-color: rgba(0, 102, 204, 0.1);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--duration-base) var(--easing);
  margin-bottom: var(--spacing-16);
}

.projection-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.projection-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Calculate userAge from Q1 answer**

Add this helper function to ResultsScreen component:

```typescript
function getUserAgeFromQ1Answer(answer: AnswerValue): number {
  // Q1: age brackets mapped to midpoint
  // ก. >55 → 60, ข. 45–55 → 50, ค. 35–44 → 40, ง. <35 → 30
  const ageMap: Record<AnswerValue, number> = {
    1: 60,
    2: 50,
    3: 40,
    4: 30,
  };
  return ageMap[answer];
}
```

Then in the component, calculate before rendering:
```typescript
const userAge = getUserAgeFromQ1Answer(answers[1] as AnswerValue);
```

- [ ] **Step 6: Update imports**

At top of file, add:
```typescript
import { useState } from 'react';
import ProjectionScreen from './ProjectionScreen';
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ResultsScreen.tsx
git commit -m "feat: add projection button to results screen"
```

---

### Task 10: Update App.tsx for Conditional Rendering

**Files:**
- Modify: `src/App.tsx` (optional - if using modal/overlay pattern)

- [ ] **Step 1: No changes needed**

Since ProjectionScreen is rendered conditionally inside ResultsScreen (via state), no changes to App.tsx routing are needed.

- [ ] **Step 2: Verify app still builds**

```bash
npm run build
```

Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "build: verify projection feature builds successfully"
```

---

### Task 11: Test Projection Feature on Mobile

**Files:**
- Test: All new components

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test on desktop first**

1. Complete questionnaire
2. See results screen
3. Click "💡 ดูการลงทุนของคุณ" button
4. Verify input section appears with currency field + slider
5. Enter ฿10,000 monthly savings
6. Verify chart appears with two lines
7. Verify summary card shows correct final balances
8. Adjust year slider: chart should update in real-time
9. Click back button: return to results screen

- [ ] **Step 3: Test on mobile (landscape 768px)**

1. Repeat steps 1-9 but verify:
   - Layout is responsive
   - No horizontal scrolling
   - Buttons are ≥44px height
   - Chart is readable

- [ ] **Step 4: Test on mobile (portrait 375px)**

1. Repeat steps 1-9 but verify:
   - Input fields stack properly
   - Slider is usable on small screen
   - Chart is readable at small size

- [ ] **Step 5: Test edge cases**

1. Enter ฿0: verify error message "กรุณาใส่จำนวนเงิน"
2. Set year to minimum (5): chart shows only 5 years
3. Set year to maximum (90 - age): chart shows correct range
4. Very large amount (฿100,000): chart scales properly

- [ ] **Step 6: Commit final testing pass**

```bash
git add -A
git commit -m "test: verify projection feature works on all screen sizes"
```

---

## Summary

Total tasks: 11
- Utilities: 3 (return rates, max years, calculations)
- Hooks: 1 (useProjectionCalculator)
- Components: 4 (Input, Chart, Summary, Screen)
- Integration: 2 (ResultsScreen, App)
- Testing: 1 (manual mobile testing)

All work is client-side, no backend required. Components follow existing project patterns (plain CSS, TypeScript, React hooks).

---

## Plan complete!

**Plan saved to `docs/superpowers/plans/2026-06-13-investment-projection-implementation.md`.**

Two execution options:

**Option 1: Subagent-Driven (Recommended)**
I dispatch a fresh subagent for each task, review between tasks, fast iteration. Each task is independent and tracked with checkboxes.

**Option 2: Inline Execution**  
Execute tasks in this session using superpowers:executing-plans, batch execution with checkpoints for review.

**Which approach would you prefer?**