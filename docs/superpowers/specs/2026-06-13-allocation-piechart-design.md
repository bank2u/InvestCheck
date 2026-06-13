# Allocation Pie Chart Design Spec

## Goal

Replace the 2×2 allocation box grid in ResultsScreen with a static SVG donut chart + legend list, giving users a cleaner visual breakdown of their portfolio allocation.

---

## Scope

Single new component `AllocationChart.tsx` (+ CSS). One change to `ResultsScreen.tsx` to swap the grid for the new component. No changes to data model, types, or allocation values.

---

## Component: AllocationChart

**File:** `src/components/AllocationChart.tsx`
**CSS:** `src/components/AllocationChart.css`

### Props

```typescript
interface AllocationItem {
  name: string;
  percentage: number;
  color: string;
}

interface Props {
  allocations: AllocationItem[];
}
```

`ResultsScreen` already builds this array:
```typescript
const allocations = [
  profile.allocations.debt,
  profile.allocations.equity,
  profile.allocations.cash,
  profile.allocations.alternative,
];
```

Pass it directly to `<AllocationChart allocations={allocations} />`.

---

## SVG Donut

- **ViewBox:** `0 0 200 200` (square)
- **Center:** `cx=100, cy=100`
- **Outer radius:** `80`
- **Inner radius:** `50` (donut hole — 62.5% of outer)
- **Segment gap:** `2px` stroke gap between slices via a tiny angular offset
- **Rendering:** SVG `<path>` arc segments, one per non-zero allocation
- **Zero slices:** Skip any allocation where `percentage === 0` (เงินสด is always 0)

### Arc path calculation

Each segment is a `<path>` using SVG arc commands:

```
M x1 y1          ← outer arc start
A R R 0 largeArc 1 x2 y2   ← outer arc end
L ix2 iy2        ← line to inner arc end
A r r 0 largeArc 0 ix1 iy1  ← inner arc back
Z                ← close
```

Where:
- `R = 80` (outer radius), `r = 50` (inner radius)
- `largeArc = percentage > 50 ? 1 : 0`
- Angular gap of `1.5°` subtracted from each segment's sweep to create visual separation
- Angles computed as cumulative sum of `(percentage / 100) * 360`

---

## Legend List

Rendered below the donut as a `<div>` list, not SVG.

- **Filter:** only non-zero allocations (same filter as donut)
- **Sort:** by `percentage` descending — dominant asset first
- **Each row:**
  ```
  [12×12 colored square]  [Thai name]  [percentage%]
  ```
- Name left-aligned, percentage right-aligned (`justify-content: space-between`)

---

## Layout & Sizing

```
┌─────────────────────────┐
│     [Donut SVG]         │  ← centered, max-width 180px
│                         │
│  ● เงินฝาก & พันธบัตร 60%│  ← legend rows
│  ● หุ้น               30%│
│  ● ทางเลือก           10%│
└─────────────────────────┘
```

- Donut SVG: `width: 100%`, `max-width: 180px`, `margin: 0 auto`
- Legend: `width: 100%`, `max-width: 280px`, `margin: 0 auto`
- Container: `display: flex; flex-direction: column; align-items: center; gap: 20px`
- Mobile (≤480px): same layout, donut max-width `160px`

---

## Colors

Unchanged from existing `allocations.ts`:

| Asset | Color |
|-------|-------|
| เงินฝาก & พันธบัตร | `#10b981` |
| หุ้น | `#f59e0b` |
| เงินสด | `#3b82f6` (skipped — always 0%) |
| ทางเลือก | `#8b5cf6` |

---

## ResultsScreen Changes

Replace in `ResultsScreen.tsx`:
```tsx
// Remove:
<div className="allocations-grid">
  {allocations.map((allocation) => (
    <div key={allocation.name} className="allocation-box">
      ...
    </div>
  ))}
</div>

// Add:
<AllocationChart allocations={allocations} />
```

Remove `.allocations-grid`, `.allocation-box`, `.allocation-color`, `.allocation-name`, `.allocation-percentage` CSS rules from `ResultsScreen.css` (no longer used).

---

## No Animation, No Interaction

Static render only. No hover, no tap-to-highlight, no entrance animation. YAGNI.

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/AllocationChart.tsx` | Create |
| `src/components/AllocationChart.css` | Create |
| `src/components/ResultsScreen.tsx` | Modify — swap grid for AllocationChart |
| `src/components/ResultsScreen.css` | Modify — remove unused grid/box styles |
