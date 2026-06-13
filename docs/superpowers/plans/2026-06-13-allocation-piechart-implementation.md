# Allocation Pie Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2×2 allocation box grid in ResultsScreen with a static SVG donut chart + legend list.

**Architecture:** A new `AllocationChart` component receives the existing `allocations` array from ResultsScreen and renders an SVG donut using `<path>` arc segments (one per non-zero allocation) plus a legend list below. No libraries, no animation, no interaction — pure SVG + plain CSS.

**Tech Stack:** React 18, TypeScript, plain CSS, SVG path arcs

---

### Task 1: Create AllocationChart component

**Files:**
- Create: `src/components/AllocationChart.tsx`
- Create: `src/components/AllocationChart.css`

**Context:**
- ViewBox is `0 0 200 200`, center at `(100, 100)`
- Outer radius `R = 80`, inner radius `r = 50`
- Each segment is a `<path>` using SVG arc commands
- Angular gap of `1.5°` (in radians: `Math.PI / 120`) is subtracted from each segment's sweep
- Zero-percentage allocations are skipped
- Legend is sorted descending by percentage

**Arc math helper — polarToCartesian:**
```typescript
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0° is at top
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}
```

**Arc path builder — describeArc:**
```typescript
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number
): string {
  const gapDeg = 1.5;
  const s = startDeg + gapDeg / 2;
  const e = endDeg - gapDeg / 2;
  if (e <= s) return '';

  const o1 = polarToCartesian(cx, cy, outerR, s);
  const o2 = polarToCartesian(cx, cy, outerR, e);
  const i1 = polarToCartesian(cx, cy, innerR, e);
  const i2 = polarToCartesian(cx, cy, innerR, s);
  const largeArc = e - s > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}
```

- [ ] **Step 1: Create `src/components/AllocationChart.tsx`**

```tsx
import './AllocationChart.css';

interface AllocationItem {
  name: string;
  percentage: number;
  color: string;
}

interface Props {
  allocations: AllocationItem[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number
): string {
  const gapDeg = 1.5;
  const s = startDeg + gapDeg / 2;
  const e = endDeg - gapDeg / 2;
  if (e <= s) return '';

  const o1 = polarToCartesian(cx, cy, outerR, s);
  const o2 = polarToCartesian(cx, cy, outerR, e);
  const i1 = polarToCartesian(cx, cy, innerR, e);
  const i2 = polarToCartesian(cx, cy, innerR, s);
  const largeArc = e - s > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export default function AllocationChart({ allocations }: Props) {
  const nonZero = allocations
    .filter((a) => a.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const cx = 100, cy = 100, outerR = 80, innerR = 50;
  let currentDeg = 0;

  const segments = nonZero.map((item) => {
    const sweep = (item.percentage / 100) * 360;
    const path = describeArc(cx, cy, outerR, innerR, currentDeg, currentDeg + sweep);
    currentDeg += sweep;
    return { ...item, path };
  });

  return (
    <div className="allocation-chart">
      <svg
        viewBox="0 0 200 200"
        className="donut-svg"
        role="img"
        aria-label="กราฟการจัดสรรเงินลงทุน"
      >
        {segments.map((seg) => (
          <path key={seg.name} d={seg.path} fill={seg.color} />
        ))}
      </svg>

      <div className="donut-legend">
        {nonZero.map((item) => (
          <div key={item.name} className="legend-row">
            <span className="legend-swatch" style={{ backgroundColor: item.color }} />
            <span className="legend-name">{item.name}</span>
            <span className="legend-pct">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/AllocationChart.css`**

```css
.allocation-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.donut-svg {
  width: 100%;
  max-width: 180px;
  height: auto;
  display: block;
}

.donut-legend {
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 15px;
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.legend-pct {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

@media (max-width: 480px) {
  .donut-svg {
    max-width: 160px;
  }

  .legend-name,
  .legend-pct {
    font-size: 14px;
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Volumes/mydata/playground/pre-invest-test
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AllocationChart.tsx src/components/AllocationChart.css
git commit -m "feat: add AllocationChart donut SVG component"
```

---

### Task 2: Wire AllocationChart into ResultsScreen

**Files:**
- Modify: `src/components/ResultsScreen.tsx`
- Modify: `src/components/ResultsScreen.css`

**Context:**
Current `ResultsScreen.tsx` at line 46–60 renders:
```tsx
<div className="allocations-section">
  <h2 className="section-title">การจัดสรรเงินลงทุน</h2>
  <div className="allocations-grid">
    {allocations.map((allocation) => (
      <div key={allocation.name} className="allocation-box">
        <div className="allocation-color" style={{ backgroundColor: allocation.color }} />
        <div className="allocation-name">{allocation.name}</div>
        <div className="allocation-percentage">{allocation.percentage}%</div>
      </div>
    ))}
  </div>
</div>
```

Replace the `allocations-grid` div with `<AllocationChart allocations={allocations} />`.

Current `ResultsScreen.css` lines 64–106 contain `.allocations-grid`, `.allocation-box`, `.allocation-box:hover`, `.allocation-color`, `.allocation-name`, `.allocation-percentage` — all to be removed.

- [ ] **Step 1: Add import to `ResultsScreen.tsx`**

At the top of `src/components/ResultsScreen.tsx`, add after the existing imports:
```tsx
import AllocationChart from './AllocationChart';
```

- [ ] **Step 2: Replace the grid in `ResultsScreen.tsx`**

Find and replace this block (lines 48–59):
```tsx
        <div className="allocations-grid">
          {allocations.map((allocation) => (
            <div key={allocation.name} className="allocation-box">
              <div
                className="allocation-color"
                style={{ backgroundColor: allocation.color }}
              />
              <div className="allocation-name">{allocation.name}</div>
              <div className="allocation-percentage">{allocation.percentage}%</div>
            </div>
          ))}
        </div>
```

Replace with:
```tsx
        <AllocationChart allocations={allocations} />
```

- [ ] **Step 3: Remove unused CSS from `ResultsScreen.css`**

Remove these rule blocks entirely from `src/components/ResultsScreen.css`:

```css
.allocations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-16);
}

.allocation-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  background-color: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--duration-base) var(--easing);
}

.allocation-box:hover {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.1);
  border-color: var(--color-primary);
}

.allocation-color {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.allocation-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.allocation-percentage {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
```

Also remove the mobile override for `.allocations-grid` in the `@media (max-width: 480px)` block:
```css
  .allocations-grid {
    grid-template-columns: 1fr;
  }

  .allocation-box {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }

  .allocation-color {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
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
git commit -m "feat: replace allocation grid with AllocationChart donut"
```
